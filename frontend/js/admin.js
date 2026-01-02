if (localStorage.getItem("adminLoggedIn") !== "true") {
  alert("Please login first");
  window.location.href = "admin-login.html";
}
const tableBody = document.querySelector("#incident-table tbody");
const modal = document.getElementById("review-modal");

async function loadIncidents() {
  const res = await fetch("/api/incidents");
  const data = await res.json();

  tableBody.innerHTML = "";
  data.forEach(i => {
    tableBody.innerHTML += `
      <tr>
        <td>${i.reporterName}</td>
        <td>${i.incidentType}</td>
        <td>${i.status}</td>
        <td>
          <button class="review-btn" data-id="${i._id}">Review Report</button>
        </td>
      </tr>
    `;
  });
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
          loadIncidents(); // reload incidents list
        } else {
          alert("Failed to delete: " + data.message);
        }
      } catch (err) {
        alert("Error deleting incident: " + err.message);
      }
    }
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

data.forEach(i => {
  tableBody.innerHTML += `
    <tr>
      <td data-label="Reporter">${i.reporterName}</td>
      <td data-label="Type">${i.incidentType}</td>
      <td data-label="Status">${i.status}</td>
      <td data-label="Action">
        <button class="review-btn" data-id="${i._id}">Review Report</button>
        <button class="delete-btn" data-id="${i._id}">Delete</button>
      </td>
    </tr>
  `;
});

loadIncidents();
