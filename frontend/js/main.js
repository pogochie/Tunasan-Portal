const form = document.getElementById("incident-form");

// Initialize Leaflet map centered on Barangay Tunasan (example coords)
const map = L.map("map").setView([14.4089, 121.0341], 15); // Tunasan coords
// Ensure proper sizing after render and on resize
setTimeout(() => map.invalidateSize(), 0);
window.addEventListener("resize", () => map.invalidateSize());

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

async function registerServiceWorker() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');

      const subscription = await registration.pushManager.getSubscription() ||
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array('BJyVEl1sk0MNoWxlxdP7a3oCSVJ_UVB0HgQxBUpUSMu4xT1Mwha194nxqYiDUfnSuk4mj8Ud-cNJwUCDB6Pu_3o')
        });

      // Send subscription to backend to save
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      console.log('User subscribed for push notifications');
    } catch (error) {
      console.error('Service Worker registration or subscription failed:', error);
    }
  } else {
    console.warn('Push messaging is not supported');
  }
}

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

registerServiceWorker();