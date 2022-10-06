const searchInput = document.getElementById("search");
const resultList = document.getElementById("result-list");
const mapContainer = document.getElementById("map-container");
const currentMarkers = [];
let lat = 37.7749;
let long = -122.4194;
let view = 13;

//create Leaflet map container
const map = L.map(mapContainer).setView([lat, long], view);

//OSM basemap layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//search field
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = searchInput.value;
  queryResults(input);
});
//search button
document.getElementById("search-button").addEventListener("click", (event) => {
  event.preventDefault();
  const input = searchInput.value;
  queryResults(input);
});

//Handle Nominatim query results
let query = "San Francisco";
queryResults(query);
function queryResults(query) {
  fetch(
    `https://nominatim.openstreetmap.org/search?format=json&polygon=1&amenity=post_office&q=${query}`
  )
    .then((res) => res.json())
    .then((jResult) => {
      lat = jResult[0].lat;
      long = jResult[0].lon;
      setResultList(jResult);
    });
}

const clickedLayerGroup = L.layerGroup().addTo(map);

//handle getting results
function setResultList(jResult) {
  resultList.innerHTML = "";
  for (const marker of currentMarkers) {
    map.removeLayer(marker);
  }
  map.setView(new L.LatLng(lat, long), view);

  for (const result of jResult) {
    //placing markers at locations
    const position = new L.LatLng(result.lat, result.lon);
    currentMarkers.push(
      new L.marker(position).addTo(map).bindTooltip(() => {
        return L.Util.template(`<b>Name: </b>${result.display_name}<br/>`);
      })
    );

    //handle list of places on left
    const li = document.createElement("li");
    li.classList.add("list-group-item", "list-group-item-action");
    const latiLongi = { lat: result.lat, lon: result.lon };
    li.innerHTML = result.display_name;
    console.log(latiLongi);

    //handling map movement & special icon on location click from list
    li.addEventListener("click", (event) => {
      for (const child of resultList.children) {
        child.classList.remove("active");
      }
      clickedLayerGroup.clearLayers();
      event.target.classList.add("active");
      const clickedData = latiLongi;
      console.log(clickedData)
      map.setView(latiLongi, 13);

      //create special icon
      const clickedIcon = L.icon({
        iconUrl: "picked-color.png",
        iconSize: [38, 75],
        iconAnchor: latiLongi, //FIXX THISS to the clicked item location
        popupAnchor: [-5, -20],
      });
      L.marker(position, { icon: clickedIcon })
        .addTo(clickedLayerGroup).
        bindTooltip(() => {return L.Util.template(`<b>${result.display_name}</b>`)});
    });

    resultList.appendChild(li);
  }
}
