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

async function reviewReport(id) {
  const res = await fetch("/api/incidents");
  const incidents = await res.json();
  const incident = incidents.find(i => i._id === id);

  modal.style.display = "block";
  modal.innerHTML = `
    <h3>Review Incident</h3>
    <p>${incident.description}</p>
    <p><strong>Location:</strong> ${incident.location}</p>

    ${incident.images.map(img => `<img src="${img}" width="200">`).join("")}

    <br><br>
    <button onclick="approve('${id}')">Approve → Publish News</button>
    <button onclick="reject('${id}')">Reject</button>
  `;
}

loadIncidents();
