const form = document.getElementById("incident-form");

// Initialize Leaflet map centered on Barangay Tunasan (example coords)
const map = L.map("map").setView([14.4089, 121.0341], 15); // Tunasan coords

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Ensure proper sizing after render and on resize / drawer toggles
setTimeout(() => map.invalidateSize(), 0);
window.addEventListener("resize", () => map.invalidateSize());
window.addEventListener("drawer:toggle", () => setTimeout(() => map.invalidateSize(), 250));

// Prefill from URL (QR context)
(function prefillFromURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "report") {
      document.getElementById("incident-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      const typePrefill = params.get("type");
      if (typePrefill) {
        const typeInput = document.querySelector('input[name="incidentType"]');
        if (typeInput) typeInput.value = typePrefill;
      }
      const descPrefill = params.get("desc");
      if (descPrefill) {
        const descInput = document.querySelector('textarea[name="description"]');
        if (descInput) descInput.value = descPrefill;
      }
    }
  } catch (_) {}
})();

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

// Geolocate and set marker/hidden inputs
document.getElementById("geo-btn")?.addEventListener("click", async () => {
  if (!("geolocation" in navigator)) return alert("Geolocation not supported.");
  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
    });
    const { latitude: lat, longitude: lng } = pos.coords;
    if (marker) marker.remove();
    marker = L.marker([lat, lng]).addTo(map);
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
    map.setView([lat, lng], 17);
    setTimeout(() => map.invalidateSize(), 0);
  } catch (e) {
    alert("Failed to get location.");
  }
});

// Helper: compress images before upload
async function compressImage(file, { maxWidth = 1280, quality = 0.7 } = {}) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, maxWidth / img.width);
  canvas.width = Math.floor(img.width * scale);
  canvas.height = Math.floor(img.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg", quality));
  URL.revokeObjectURL(img.src);
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lat = document.getElementById("lat").value;
  const lng = document.getElementById("lng").value;
  if (!lat || !lng) {
    e.preventDefault();
    alert("Please select a location on the map.");
    return;
  }

  // Build FormData manually to inject compressed images
  const formData = new FormData();
  // Append text fields
  Array.from(form.elements).forEach(el => {
    if (!el.name) return;
    if (el.type === "file") return; // handle below
    formData.append(el.name, el.value);
  });
  // Compress and append images
  const fileInput = form.querySelector('input[type="file"][name="images"]');
  const files = fileInput?.files ? Array.from(fileInput.files) : [];
  for (const f of files) {
    try {
      const compressed = await compressImage(f);
      formData.append("images", compressed);
    } catch {
      // fallback original if compression fails
      formData.append("images", f);
    }
  }

  // Offline-first: queue if offline
  // ... existing offline queue code ...

  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      body: formData
    });
    // ... existing response parsing ...
  } catch (err) {
    alert("Network error: " + err.message);
  }
});

// async function registerServiceWorker() {
//   if ('serviceWorker' in navigator && 'PushManager' in window) {
//     try {
//       const registration = await navigator.serviceWorker.register('/sw.js');
//       console.log('Service Worker registered');

//       const subscription = await registration.pushManager.getSubscription() ||
//         await registration.pushManager.subscribe({
//           userVisibleOnly: true,
//           applicationServerKey: urlBase64ToUint8Array('BJyVEl1sk0MNoWxlxdP7a3oCSVJ_UVB0HgQxBUpUSMu4xT1Mwha194nxqYiDUfnSuk4mj8Ud-cNJwUCDB6Pu_3o')
//         });

//       // Send subscription to backend to save
//       await fetch('/api/notifications/subscribe', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(subscription)
//       });

//       console.log('User subscribed for push notifications');
//     } catch (error) {
//       console.error('Service Worker registration or subscription failed:', error);
//     }
//   } else {
//     console.warn('Push messaging is not supported');
//   }
// }

// // Utility to convert VAPID key
// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - base64String.length % 4) % 4);
//   const base64 = (base64String + padding)
//     .replace(/\-/g, '+')
//     .replace(/_/g, '/');
//   const rawData = window.atob(base64);
//   return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
// }

// registerServiceWorker();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}