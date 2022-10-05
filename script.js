const searchInput = document.getElementById("search");
const resultList = document.getElementById("result-list");
const mapContainer = document.getElementById("map-container");
const currentMarkers = [];
let lat = 52.5170365;
let long = 13.3888599;
let view = 13;

const map = L.map(mapContainer).setView([lat, long], view);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let query = "Berlin";

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

queryResults(query);

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = searchInput.value;
  queryResults(input);
});

document.getElementById("search-button").addEventListener("click", (event) => {
  event.preventDefault();
  const input = searchInput.value;
  queryResults(input);
});

function setResultList(jResult) {
  resultList.innerHTML = "";
  for (const marker of currentMarkers) {
    map.removeLayer(marker);
  }
  map.setView(new L.LatLng(lat, long), view);
  for (const result of jResult) {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "list-group-item-action");
    const latiLongi = { lat: result.lat, lon: result.lon };
    li.innerHTML = result.display_name;
    li.addEventListener("click", (event) => {
      for (const child of resultList.children) {
        child.classList.remove("active");
      }
      event.target.classList.add("active");
      const clickedData = latiLongi;
      const position = new L.LatLng(clickedData.lat, clickedData.lon);
      map.setView(position, 13);
    });
    const position = new L.LatLng(result.lat, result.lon);
    currentMarkers.push(
      new L.marker(position).addTo(map).bindTooltip(() => {
        return L.Util.template(`<b>Name: </b>${result.display_name}<br/>`);
      })
    );
    resultList.appendChild(li);
  }
}
