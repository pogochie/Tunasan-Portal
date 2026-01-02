const newsList = document.getElementById("news-list");

async function loadNews() {
  const res = await fetch("/api/news");
  const newsItems = await res.json();

  newsList.innerHTML = "";
  newsItems.forEach(item => {
    newsList.innerHTML += `
      <li>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button class="delete-news-btn" data-id="${item._id}">Delete</button>
      </li>
    `;
  });
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
