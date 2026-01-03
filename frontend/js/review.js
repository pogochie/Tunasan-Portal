const urlParams = new URLSearchParams(window.location.search);
const incidentId = urlParams.get("id");

if (!incidentId) {
  alert("No incident ID provided");
  window.location.href = "admin.html";
}

const reporterNameEl = document.getElementById("reporterName");
const incidentTypeEl = document.getElementById("incidentType");
const descriptionEl = document.getElementById("description");
const locationTextEl = document.getElementById("locationText");
const imagesEl = document.getElementById("images");
const approveBtn = document.getElementById("approveBtn");
const rejectBtn = document.getElementById("rejectBtn");
const backBtn = document.getElementById("backBtn");

const commentsList = document.getElementById("comments-list");
const commentForm = document.getElementById("comment-form");
const commentText = document.getElementById("comment-text");

let map, marker;

// Robust data loading and UI fill for review page
(async function initReview() {
  const params = new URLSearchParams(window.location.search);
  const incidentId = params.get("id");
  if (!incidentId) {
    alert("No incident ID provided");
    window.location.href = "admin.html";
    return;
  }

  const reporterEl = document.getElementById("reporterName");
  const typeEl = document.getElementById("incidentType");
  const descEl = document.getElementById("description");
  const locTextEl = document.getElementById("locationText");
  const imagesEl = document.getElementById("images");

  function initMap(lat, lng) {
    map = L.map("map").setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map);
    setTimeout(() => map.invalidateSize(), 0);
    window.addEventListener("resize", () => map.invalidateSize());
    window.addEventListener("drawer:toggle", () => setTimeout(() => map.invalidateSize(), 250));
  }

  try {
    const res = await fetch(`/api/incidents/${incidentId}`);
    if (!res.ok) throw new Error("Incident not found");
    const incident = await res.json();

    // Fill fields defensively
    reporterEl.textContent = incident.reporterName || "N/A";
    typeEl.textContent = incident.incidentType || "N/A";
    descEl.textContent = incident.description || "No description";

    // Location could be object or string; normalize
    let lat = 14.4089, lng = 121.0341;
    if (incident.location) {
      if (typeof incident.location === "string") {
        try {
          const loc = JSON.parse(incident.location);
          if (loc.lat && loc.lng) { lat = loc.lat; lng = loc.lng; }
        } catch (_) {}
      } else if (incident.location.lat && incident.location.lng) {
        lat = incident.location.lat;
        lng = incident.location.lng;
      }
      locTextEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } else {
      locTextEl.textContent = "No location provided";
    }
    initMap(lat, lng);

    // Images
    imagesEl.innerHTML = "";
    if (Array.isArray(incident.images) && incident.images.length > 0) {
      incident.images.forEach((img) => {
        const image = document.createElement("img");
        image.src = img;
        image.loading = "lazy";
        image.decoding = "async";
        imagesEl.appendChild(image);
      });
    } else {
      imagesEl.textContent = "No images uploaded";
    }

    // Load comments
    try {
      const cRes = await fetch(`/api/incidents/${incidentId}/comments`);
      const comments = cRes.ok ? await cRes.json() : [];
      const list = document.getElementById("comments-list");
      list.innerHTML = "";
      if (comments.length === 0) {
        list.innerHTML = "<li>No comments yet.</li>";
      } else {
        comments.forEach(c => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${c.user || "User"}</strong> (${c.role || "resident"})<br>${c.comment}`;
          list.appendChild(li);
        });
      }
    } catch (_) {}

    // Actions
    document.getElementById("approveBtn").addEventListener("click", async () => {
      if (!confirm("Approve this incident and publish as news?")) return;
      try {
        const res = await fetch(`/api/incidents/${incidentId}/approve`, { method: "POST" });
        const data = await res.json();
        alert(data.message || "Approved");
        window.location.href = "admin.html";
      } catch (err) {
        alert("Error: " + err.message);
      }
    });

    document.getElementById("rejectBtn").addEventListener("click", async () => {
      if (!confirm("Reject this incident?")) return;
      try {
        const res = await fetch(`/api/incidents/${incidentId}/reject`, { method: "POST" });
        const data = await res.json();
        alert(data.message || "Rejected");
        window.location.href = "admin.html";
      } catch (err) {
        alert("Error: " + err.message);
      }
    });

    document.getElementById("backBtn").addEventListener("click", () => {
      window.history.length > 1 ? window.history.back() : window.location.href = "admin.html";
    });

    // Comment form
    const form = document.getElementById("comment-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const commentText = document.getElementById("comment-text").value.trim();
      if (!commentText) return;
      const username = localStorage.getItem("username") || "Admin";
      const role = localStorage.getItem("role") || "admin";
      try {
        const res = await fetch(`/api/incidents/${incidentId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: username, role, comment: commentText })
        });
        const data = await res.json();
        if (res.ok) {
          alert(data.message || "Comment added");
          // Optimistic append
          const list = document.getElementById("comments-list");
          const li = document.createElement("li");
          li.innerHTML = `<strong>${username}</strong> (${role})<br>${commentText}`;
          list.prepend(li);
          form.reset();
        } else {
          alert("Failed: " + (data.message || "Could not add comment"));
        }
      } catch (err) {
        alert("Error: " + err.message);
      }
    });

  } catch (err) {
    alert("Failed to load incident: " + err.message);
    window.location.href = "admin.html";
  }
})();