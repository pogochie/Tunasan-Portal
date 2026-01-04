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

  // --- Global search wiring ---
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  function applyQuery(q) {
    const query = (q || "").trim().toLowerCase();
    const lists = [
      document.querySelector("#home-feed"),
      document.querySelector("#news-list"),
      document.querySelector("#incidents-list")
    ].filter(Boolean);

    lists.forEach(list => {
      const cards = list.querySelectorAll(".post-card");
      let shown = 0;

      cards.forEach(card => {
        // Skip placeholder skeletons or "no results" messages
        if (card.classList.contains("skeleton") || card.classList.contains("no-results")) return;
        const txt = card.textContent.toLowerCase();
        const show = !query || txt.includes(query);
        card.style.display = show ? "" : "none";
        if (show) shown++;
      });

      // No results message per list
      const noMsg = list.querySelector(".no-results");
      if (query && shown === 0) {
        if (!noMsg) {
          const msg = document.createElement("li");
          msg.className = "post-card no-results";
          msg.textContent = "No matching results.";
          list.appendChild(msg);
        }
      } else if (noMsg) {
        noMsg.remove();
      }
    });

    // Reflect query in URL without page reload
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  }

  const runSearch = () => applyQuery(searchInput?.value || "");

  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); runSearch(); }
      else if (e.key === "Escape") { searchInput.value = ""; runSearch(); }
    });
  }
  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", (e) => { e.preventDefault(); runSearch(); });
  }

  // Apply ?q=... on load and once feeds finish loading
  const paramQ = new URLSearchParams(window.location.search).get("q");
  if (paramQ && searchInput) {
    searchInput.value = paramQ;
    // Try immediately and also after feeds render
    setTimeout(runSearch, 0);
    window.addEventListener("feed:loaded", () => setTimeout(runSearch, 0), { once: true });
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

// Auto-init if partial is already on page and module loaded late
if (document.querySelector(".navbar")) {
  try { initNavbar(); } catch (e) {}
}