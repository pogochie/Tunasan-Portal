console.log("main.js loaded");

const form = document.getElementById("incident-form");

if (!form) {
  console.error("❌ FORM NOT FOUND");
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("✅ Form Submitted");

  const data = {
    reporterName: document.getElementById("reporter").value,
    incidentType: document.getElementById("type").value,
    description: document.getElementById("description").value,
    location: document.getElementById("location").value
  };

  console.log("Sending data:", data);

  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log("Server response:", result);

    alert("Report submitted successfully");
    form.reset();
  } catch (err) {
    console.error("❌ Fetch error:", err);
  }
});
