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
          <button onclick="reviewReport('${i._id}')">Review Report</button>
        </td>
      </tr>
    `;
  });
}

function reviewReport(id) {
  window.location.href = `review.html?id=${id}`;
}

loadIncidents();
