console.log("main.js loaded");

const form = document.getElementById("incident-form");

if (!form) {
  console.error("❌ FORM NOT FOUND");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch("/api/incidents", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  alert(data.message);
  form.reset();
});

