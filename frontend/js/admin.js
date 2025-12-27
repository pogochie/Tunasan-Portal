const tableBody = document.querySelector("#incident-table tbody");

// Fetch incidents and populate table
const fetchIncidents = async () => {
  const res = await fetch("/api/incidents");
  const incidents = await res.json();

  tableBody.innerHTML = "";
  incidents.forEach((incident) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${incident.reporterName}</td>
      <td>${incident.incidentType}</td>
      <td>${incident.description}</td>
      <td>${incident.location}</td>
      <td>${incident.status}</td>
      <td>
        <button onclick="updateStatus('${incident._id}','Pending')">Pending</button>
        <button onclick="updateStatus('${incident._id}','In Progress')">In Progress</button>
        <button onclick="updateStatus('${incident._id}','Resolved')">Resolved</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

const updateStatus = async (id, status) => {
  await fetch(`/api/incidents/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  fetchIncidents();
};

// Initial load
fetchIncidents();
