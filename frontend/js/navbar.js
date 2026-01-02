// Simple admin auth state using localStorage (for demo only)
const adminLink = document.getElementById("admin-link");
const logoutLink = document.getElementById("logout-link");

function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  if (isLoggedIn) {
    adminLink.style.display = "inline-block";
    logoutLink.style.display = "inline-block";
  } else {
    adminLink.style.display = "none";
    logoutLink.style.display = "none";
  }
}

logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("adminLoggedIn");
  checkAdminAuth();
  window.location.href = "index.html";
});

checkAdminAuth();