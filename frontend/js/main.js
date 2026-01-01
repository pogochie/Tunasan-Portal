// QR Code generation
import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js";

const qrContainer = document.getElementById("qr-code");
const API_URL = "https://tunasan-portal.onrender.com/api/incidents";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    reporterName: document.getElementById("reporter").value,
    incidentType: document.getElementById("type").value,
    description: document.getElementById("description").value,
    location: document.getElementById("location").value
  };

  console.log("📤 Sending data:", payload);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  alert(data.message);
});


