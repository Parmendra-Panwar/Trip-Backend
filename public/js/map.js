// const lati = require("../../controller/listing");
// const long = require("../../controller/listing");
// Initialize the map with the provided latitude and longitude
const map = L.map('map').setView([window.lat, window.lon], 13);

// Use OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 12,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a marker with a popup
L.marker([window.lat, window.lon]).addTo(map)
  .bindPopup('Exect Location will we provide after paymant 😊')
