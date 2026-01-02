const form = document.getElementById("incident-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch("/api/incidents", {
      method: "POST",
      body: formData
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (res.ok) {
        alert(data.message);
        form.reset();
      } else {
        alert("Failed to submit report: " + (data.message || text));
      }
    } catch {
      console.error("Response is not JSON:", text);
      alert("Unexpected server response. See console.");
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});