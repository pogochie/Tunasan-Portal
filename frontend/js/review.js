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

async function loadIncident() {
  try {
    const res = await fetch(`/api/incidents/${incidentId}`);
    if (!res.ok) throw new Error("Incident not found");
    const incident = await res.json();

    reporterNameEl.textContent = incident.reporterName;
    incidentTypeEl.textContent = incident.incidentType;
    descriptionEl.textContent = incident.description;

    if (typeof incident.location === "string") {
      locationTextEl.textContent = incident.location;
    } else if (incident.location && incident.location.lat && incident.location.lng) {
      locationTextEl.textContent = `Lat: ${incident.location.lat}, Lng: ${incident.location.lng}`;
      initMap(incident.location.lat, incident.location.lng);
    } else {
      locationTextEl.textContent = "No location data";
    }

    imagesEl.innerHTML = "";
    if (incident.images && incident.images.length > 0) {
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
  } catch (err) {
    alert("Failed to load incident: " + err.message);
    window.location.href = "admin.html";
  }
}

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

async function loadComments() {
  const res = await fetch(`/api/incidents/${incidentId}/comments`);
  const comments = await res.json();
  commentsList.innerHTML = "";
  comments.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `[${new Date(c.createdAt).toLocaleString()}] ${c.role} ${c.user}: ${c.comment}`;
    commentsList.appendChild(li);
  });
}

async function approveIncident() {
  if (!confirm("Approve and publish this incident as news?")) return;
  try {
    const res = await fetch(`/api/incidents/${incidentId}/approve`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to approve");
    alert("Incident approved and published as news");
    window.location.href = "admin.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
}

async function rejectIncident() {
  if (!confirm("Reject this incident report?")) return;
  try {
    const res = await fetch(`/api/incidents/${incidentId}/reject`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reject");
    alert("Incident rejected");
    window.location.href = "admin.html";
  } catch (err) {
    alert("Error: " + err.message);
  }
}

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const comment = commentText.value.trim();
  if (!comment) return;

  const user = localStorage.getItem("username") || "Unknown";
  const role = localStorage.getItem("role") || "official";

  const res = await fetch(`/api/incidents/${incidentId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, role, comment }),
  });

  if (res.ok) {
    commentText.value = "";
    loadComments();
  } else {
    alert("Failed to add comment");
  }
});

approveBtn.addEventListener("click", approveIncident);
rejectBtn.addEventListener("click", rejectIncident);
backBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});

// Socket.io real-time comments
const socket = io();
socket.on("newComment", (data) => {
  if (data.incidentId === incidentId) {
    loadComments();
  }
});

loadIncident();
loadComments();