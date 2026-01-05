const form = document.getElementById("incident-form");

// Initialize Leaflet map and marker variables globally
window.map = null;
window.marker = null;

function initMap() {
  if (window.map) {
    // If map already initialized, just invalidate size and return
    window.map.invalidateSize();
    return;
  }

  // Initialize map
  window.map = L.map("map").setView([14.4089, 121.0341], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(window.map);

  // Fix map size after render and on resize / drawer toggles
  setTimeout(() => window.map.invalidateSize(), 0);
  window.addEventListener("resize", () => window.map.invalidateSize());
  window.addEventListener("drawer:toggle", () => setTimeout(() => window.map.invalidateSize(), 250));

  // Map click to add/move marker
  window.map.on("click", function (e) {
    const { lat, lng } = e.latlng;

    if (window.marker) {
      window.marker.setLatLng(e.latlng);
    } else {
      window.marker = L.marker(e.latlng).addTo(window.map);
    }

    // Update hidden inputs
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const reportBtn = document.getElementById("report-btn");
  const reportModal = document.getElementById("report-modal");
  const closeReportBtn = document.getElementById("close-report");
  const form = document.getElementById("incident-form");

  if (!reportBtn || !reportModal || !closeReportBtn || !form) {
    console.warn("Report modal elements missing");
    return;
  }

  const openModal = () => {
    reportModal.style.display = "flex";
    reportModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    form.reset();
    document.getElementById("lat").value = "";
    document.getElementById("lng").value = "";

    // Ensure modal starts at top and content is visible
    reportModal.scrollTop = 0;
    document.getElementById("report-section")?.scrollTo({ top: 0, behavior: "auto" });

    // Initialize or refresh map inside modal
    initMap();

    // Remove existing marker if any
    if (window.marker) {
      window.marker.remove();
      window.marker = null;
    }

    // Invalidate map size after modal layout settles
    setTimeout(() => window.map?.invalidateSize(), 50);
  };

  const closeModal = () => {
    reportModal.style.display = "none";
    reportModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  reportBtn.addEventListener("click", openModal);
  closeReportBtn.addEventListener("click", closeModal);

  reportModal.addEventListener("click", (e) => {
    if (e.target === reportModal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && reportModal.style.display === "flex") {
      closeModal();
    }
  });

  // Geolocate and set marker/hidden inputs
  document.getElementById("geo-btn")?.addEventListener("click", async () => {
    if (!("geolocation" in navigator)) return alert("Geolocation not supported.");
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      if (window.marker) window.marker.remove();
      window.marker = L.marker([lat, lng]).addTo(window.map);
      document.getElementById("lat").value = lat;
      document.getElementById("lng").value = lng;
      window.map.setView([lat, lng], 17);
      setTimeout(() => window.map.invalidateSize(), 0);
    } catch (e) {
      alert("Failed to get location.");
    }
  });

  // Form submission logic (compress images, send data) remains unchanged
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lat = document.getElementById("lat").value;
    const lng = document.getElementById("lng").value;
    if (!lat || !lng) {
      alert("Please select a location on the map.");
      return;
    }

    const formData = new FormData();
    Array.from(form.elements).forEach(el => {
      if (!el.name) return;
      if (el.type === "file") return;
      formData.append(el.name, el.value);
    });

    const fileInput = form.querySelector('input[type="file"][name="images"]');
    const files = fileInput?.files ? Array.from(fileInput.files) : [];
    for (const f of files) {
      try {
        const compressed = await compressImage(f);
        formData.append("images", compressed);
      } catch {
        formData.append("images", f);
      }
    }

    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        alert("Report submitted successfully.");
        form.reset();
        if (window.marker) {
          window.marker.remove();
          window.marker = null;
        }
        document.getElementById("lat").value = "";
        document.getElementById("lng").value = "";
        window.map.setView([14.4089, 121.0341], 15);
        closeModal();
      } else {
        const data = await res.json();
        alert("Failed to submit report: " + (data.message || res.statusText));
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  });
});

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

// Helper: compress images before upload (keep your existing function)
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
