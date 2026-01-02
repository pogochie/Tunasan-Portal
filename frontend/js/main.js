const form = document.getElementById("incident-form");

// Initialize Leaflet map centered on Barangay Tunasan (example coords)
const map = L.map("map").setView([14.4089, 121.0341], 15); // Tunasan coords

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let marker;

// When user clicks on map, place or move marker and update hidden inputs
map.on("click", function (e) {
  const { lat, lng } = e.latlng;

  if (marker) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  // Update hidden inputs
  document.getElementById("lat").value = lat;
  document.getElementById("lng").value = lng;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lat = document.getElementById("lat").value;
  const lng = document.getElementById("lng").value;
  if (!lat || !lng) {
    e.preventDefault();
    alert("Please select a location on the map.");
    return;
  }

  const formData = new FormData(form);

  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      body: formData
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (res.ok) {
        alert(data.message);
        form.reset();
      } else {
        alert("Failed to submit report: " + (data.message || text));
      }
    } catch {
      console.error("Response is not JSON:", text);
      alert("Unexpected server response. See console.");
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});