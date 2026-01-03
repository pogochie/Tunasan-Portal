if (localStorage.getItem("adminLoggedIn") !== "true") {
  alert("Please login first");
  window.location.href = "admin-login.html";
}
const tableBody = document.querySelector("#incident-table tbody");
const modal = document.getElementById("review-modal");

async function loadIncidents() {
  try {
    const res = await fetch("/api/incidents");
    if (!res.ok) throw new Error("Failed to fetch incidents");
    const data = await res.json();

    // Render stats summary
    const statsEl = document.getElementById("admin-stats");
    if (statsEl) {
      const total = data.length;
      const byStatus = (s) => data.filter(i => (i.status || '').toLowerCase() === s).length;
      const pending = byStatus("pending");
      const approved = byStatus("approved");
      const rejected = byStatus("rejected");
      const inProgress = byStatus("in progress");
      const resolved = byStatus("resolved");
      statsEl.innerHTML = `
        <div class="stat-card"><div class="label">Total</div><div class="value">${total}</div></div>
        <div class="stat-card"><div class="label">Pending</div><div class="value">${pending}</div></div>
        <div class="stat-card"><div class="label">Approved</div><div class="value">${approved}</div></div>
        <div class="stat-card"><div class="label">Rejected</div><div class="value">${rejected}</div></div>
        <div class="stat-card"><div class="label">In Progress</div><div class="value">${inProgress}</div></div>
        <div class="stat-card"><div class="label">Resolved</div><div class="value">${resolved}</div></div>
      `;
    }

    const tableBody = document.querySelector("#incident-table tbody");
    tableBody.innerHTML = "";
    data.forEach(i => {
      tableBody.innerHTML += `
        <tr>
          <td data-label="Reporter">${i.reporterName}</td>
          <td data-label="Type">${i.incidentType}</td>
          <td data-label="Status">${i.status}</td>
          <td data-label="Action">
            <button class="review-btn action-btn" data-id="${i._id}">Review</button>
            <button class="edit-btn action-btn" data-id="${i._id}">Edit</button>
            <button class="delete-btn action-btn" data-id="${i._id}">Delete</button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    const tableBody = document.querySelector("#incident-table tbody");
    tableBody.innerHTML = `<tr><td colspan="4">Failed to load incidents.</td></tr>`;
  }
}

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("review-btn")) {
    const id = e.target.getAttribute("data-id");
    window.location.href = `review.html?id=${id}`;
  } else if (e.target.classList.contains("delete-btn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this incident?")) {
      try {
        const res = await fetch(`/api/incidents/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          loadIncidents();
        } else {
          alert("Failed to delete: " + data.message);
        }
      } catch (err) {
        alert("Error deleting incident: " + err.message);
      }
    }
  } else if (e.target.classList.contains("edit-btn")) {
    const id = e.target.getAttribute("data-id");
    window.location.href = `admin-edit-incident.html?id=${id}`;
  }
});

function reviewReport(id) {
  window.location.href = `review.html?id=${id}`;
}

const logoutLink = document.getElementById("logout-link");
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "admin-login.html";
  });
}

loadIncidents();
