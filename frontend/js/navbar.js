// Simple admin auth state using localStorage (for demo only)
export function initNavbar() {
  const adminLink = document.getElementById("admin-link");
  const logoutLink = document.getElementById("logout-link");
  const navToggle = document.getElementById("nav-toggle");
  const overlay = document.querySelector(".nav-overlay");
  const navMenu = document.querySelector(".nav-menu");

  function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (adminLink) adminLink.style.display = isLoggedIn ? "inline-block" : "none";
    if (logoutLink) logoutLink.style.display = isLoggedIn ? "inline-block" : "none";
  }

  checkAdminAuth();

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminLoggedIn");
      checkAdminAuth();
      window.location.href = "index.html";
    });
  }

  // Mobile drawer helpers
  const dispatchDrawerToggle = () => {
    // Notify maps to invalidate size when drawer toggles
    window.dispatchEvent(new Event("drawer:toggle"));
  };

  if (navToggle) {
    navToggle.addEventListener("change", dispatchDrawerToggle);
  }
  if (overlay && navToggle) {
    overlay.addEventListener("click", () => {
      navToggle.checked = false;
      dispatchDrawerToggle();
    });
  }
  if (navMenu && navToggle) {
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navToggle.checked = false;
        dispatchDrawerToggle();
      }
    });
  }
}

(function enhanceNav() {
  try {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.fb-navbar .nav-link, .mobile-tabbar .tab-link');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  } catch (_) {}
})();

// Expose for non-module usage if needed
if (typeof window !== "undefined") {
  window.initNavbar = initNavbar;
}

// Auto-init if partial is already on page
if (document.querySelector(".fb-navbar")) {
  try { initNavbar(); } catch (e) {}
}