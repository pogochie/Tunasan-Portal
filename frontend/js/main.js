console.log("main.js loaded");

// QR CODE
const qrCanvas = document.getElementById("qr-code");
QRCode.toCanvas(qrCanvas, window.location.href, function (error) {
  if (error) console.error(error);
});

// INCIDENT FORM
const form = document.getElementById("incident-form");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("Form submitted");

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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log(result);
    alert("Report submitted successfully!");
    form.reset();
  } catch (err) {
    console.error("Submit error:", err);
  }
});
