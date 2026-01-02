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

tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("review-btn")) {
    const id = e.target.getAttribute("data-id");
    window.location.href = `review.html?id=${id}`;
  }
});

function reviewReport(id) {
  window.location.href = `review.html?id=${id}`;
}

loadIncidents();
