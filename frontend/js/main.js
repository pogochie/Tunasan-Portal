console.log("main.js loaded ✅");

// QR Code
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js";

const qrCanvas = document.getElementById("qr-code");
QRCode.toCanvas(qrCanvas, window.location.href);

// Incident form
const form = document.getElementById("incident-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Submit clicked ✅");

  const data = {
    reporterName: document.getElementById("reporter").value,
    incidentType: document.getElementById("type").value,
    description: document.getElementById("description").value,
    location: document.getElementById("location").value
  };

  console.log("Sending data:", data);

  const res = await fetch("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  alert(result.message);

  form.reset();
});
