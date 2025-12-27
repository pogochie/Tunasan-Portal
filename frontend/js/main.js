// QR Code generation
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js";

const qrContainer = document.getElementById("qr-code");
const portalURL = window.location.href;

QRCode.toCanvas(qrContainer, portalURL, (error) => {
  if (error) console.error(error);
});

// Incident form submission
const form = document.getElementById("incident-form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const reporter = document.getElementById("reporter").value;
  const type = document.getElementById("type").value;
  const description = document.getElementById("description").value;
  const location = document.getElementById("location").value;

  const response = await fetch("/api/incidents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reporterName: reporter, incidentType: type, description, location })
  });

  const data = await response.json();
  alert(data.message);
  form.reset();
});
