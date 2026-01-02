const newsList = document.getElementById("news-list");

async function loadNews() {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("Failed to fetch news");
    const newsItems = await res.json();

    newsList.innerHTML = "";
    newsItems.forEach(item => {
      newsList.innerHTML += `
        <li>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${item.images && item.images.length > 0 ? item.images.map(img => `<img src="${img}" width="200" style="margin-right:10px;">`).join("") : ""}
          <br>
          <button class="delete-news-btn" data-id="${item._id}">Delete</button>
        </li>
      `;
    });
  } catch (err) {
    console.error(err);
    newsList.innerHTML = "<li>Failed to load news.</li>";
  }
}

newsList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-news-btn")) {
    const id = e.target.getAttribute("data-id");
    if (confirm("Are you sure you want to delete this news item?")) {
      try {
        const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          loadNews();
        } else {
          alert("Failed to delete: " + data.message);
        }
      } catch (err) {
        alert("Error deleting news: " + err.message);
      }
    }
  }
});

loadNews();
