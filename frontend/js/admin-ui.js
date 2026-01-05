(function adminUI() {
  const toggle = document.getElementById("admin-nav-toggle");
  const overlay = document.querySelector(".admin-nav-overlay");
  const menu = document.querySelector(".nav-menu");

  // Close drawer when clicking overlay or a link
  function closeDrawer() { if (toggle) toggle.checked = false; }
  overlay?.addEventListener("click", closeDrawer);
  menu?.addEventListener("click", (e) => { if (e.target.tagName === "A") closeDrawer(); });

  // Highlight active link in top menu and bottom tabbar
  const path = window.location.pathname.split("/").pop();
  const links = document.querySelectorAll(".nav-menu a, .admin-mobile-tabbar .tab-link");
  links.forEach(a => {
    const href = a.getAttribute("href");
    if (href && href === path) a.classList.add("active");
  });
})();
