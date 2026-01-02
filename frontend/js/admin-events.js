const eventsList = document.getElementById("events-list");

async function loadEvents() {
  try {
    const res = await fetch("/api/events");
    if (!res.ok) throw new Error("Failed to fetch events");
    const events = await res.json();

    eventsList.innerHTML = "";
    events.forEach(event => {
      eventsList.innerHTML += `
        <li>
          <h3>${event.title}</h3>
          <p>${new Date(event.date).toLocaleDateString()}</p>
          ${event.images && event.images.length > 0 ? event.images.map(img => `<img src="${img}" width="200" style="margin-right:10px;">`).join("") : ""}
          <br>
          <button class="delete-event-btn" data-id="${event._id}">Delete</button>
        </li>
      `;
    });
  } catch (err) {
    console.error(err);
    eventsList.innerHTML = "<li>Failed to load events.</li>";
  }
}

eventsList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-event-btn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          loadEvents();
        } else {
          alert("Failed to delete: " + data.message);
        }
      } catch (err) {
        alert("Error deleting event: " + err.message);
      }
    }
  }
});

loadEvents();
