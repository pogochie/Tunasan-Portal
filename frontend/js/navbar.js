// Simple admin auth state using localStorage (for demo only)
export function initNavbar() {
  const adminLink = document.getElementById("admin-link");
  const logoutLink = document.getElementById("logout-link");
  const navToggle = document.getElementById("nav-toggle");
  const overlay = document.querySelector(".nav-overlay");
  const navMenu = document.querySelector(".nav-menu");


  const fbNav = document.querySelector(".fb-navbar");
  if (fbNav) {
    document.body.classList.add("has-fb-navbar");
  }

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
  

  // Close nav when clicking overlay
  if (overlay && navToggle) {
    overlay.addEventListener("click", () => {
      navToggle.checked = false;
    });
  }

  // Close nav when clicking a nav link (mobile)
  if (navMenu && navToggle) {
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        navToggle.checked = false;
      }
    });
  }

  // ... rest of your existing navbar code (theme toggle, language toggle, notifications) ...
  
  // Theme toggle
  const themeBtn = document.getElementById("theme-toggle");
  const applyTheme = (theme) => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    // swap icon groups
    const sun = themeBtn?.querySelector(".ico-sun");
    const moon = themeBtn?.querySelector(".ico-moon");
    if (sun && moon) {
      sun.style.display = theme === "dark" ? "none" : "block";
      moon.style.display = theme === "dark" ? "block" : "none";
    }
  };
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = document.documentElement.classList.contains("theme-dark") ? "light" : "dark";
      localStorage.setItem("theme", next);
      applyTheme(next);
    });
  }

  // Language toggle (EN/Fil)
  const langBtn = document.getElementById("lang-toggle");
  const applyLang = (lng) => {
    if (window.applyLocale) window.applyLocale(lng);
    if (langBtn) langBtn.textContent = lng === "fil" ? "FIL" : "EN";
    localStorage.setItem("locale", lng);
  };
  const savedLng = localStorage.getItem("locale") || "en";
  applyLang(savedLng);
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      const current = localStorage.getItem("locale") || "en";
      const next = current === "en" ? "fil" : "en";
      applyLang(next);
    });
  }

  // Notification center
  const notifBtn = document.getElementById("notif-btn");
  const notifPanel = document.getElementById("notif-panel");
  const notifList = document.getElementById("notif-list");
  const notifCount = document.getElementById("notif-count");
  const closeBtn = notifPanel?.querySelector(".notif-close");

  const togglePanel = (open) => {
    if (!notifPanel) return;
    notifPanel.classList.toggle("open", open);
  };

  const loadNotifications = async () => {
    try {
      const [newsRes, incRes] = await Promise.all([fetch("/api/news"), fetch("/api/incidents")]);
      const [newsItems, incidents] = await Promise.all([newsRes.json(), incRes.json()]);
      const approvedInc = incidents.filter(i => (i.status || "").toLowerCase() === "approved");
      const updates = [
        ...newsItems.map(n => ({ t: n.title, d: n.description, when: n.createdAt || Date.now(), kind: "News" })),
        ...approvedInc.map(i => ({ t: i.incidentType, d: i.description, when: i.createdAt || Date.now(), kind: "Incident" }))
      ].sort((a,b) => new Date(b.when) - new Date(a.when)).slice(0, 8);
      if (notifList) {
        notifList.innerHTML = updates.map(u =>
          `<li><strong>${u.kind}:</strong> ${u.t}<br><small>${new Date(u.when).toLocaleString()}</small></li>`
        ).join("") || `<li>No updates</li>`;
      }
      if (notifCount) notifCount.textContent = String(updates.length);
    } catch (e) {
      if (notifList) notifList.innerHTML = `<li>Failed to load updates</li>`;
    }
  };

  if (notifBtn) {
    notifBtn.addEventListener("click", async () => {
      const open = !notifPanel?.classList.contains("open");
      togglePanel(open);
      if (open) await loadNotifications();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", () => togglePanel(false));
  document.addEventListener("click", (e) => {
    if (notifPanel && notifPanel.classList.contains("open")) {
      if (!e.target.closest("#notif-panel") && !e.target.closest("#notif-btn")) togglePanel(false);
    }
  });

  // --- Global search wiring ---
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");

  function applyQuery(q) {
    const query = (q || "").trim().toLowerCase();
    const lists = [
      document.querySelector("#home-feed"),
      document.querySelector("#news-list"),
      document.querySelector("#incidents-list"),
      // ADD: include events feed
      document.querySelector("#events-list")
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

  // PWA install prompt
  const installBtn = document.getElementById("install-btn");
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = "inline-block";
  });
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }

  try {
    // Wire up global app side drawer
    const toggle = document.getElementById("app-nav-toggle");
    const overlay = document.querySelector(".app-nav-overlay");
    const drawer = document.querySelector(".app-nav-menu");
    const links = drawer ? Array.from(drawer.querySelectorAll("a")) : [];

    function closeDrawer() { if (toggle) toggle.checked = false; }

    overlay?.addEventListener("click", closeDrawer);
    drawer?.addEventListener("click", (e) => {
      if (e.target.tagName === "A") closeDrawer();
    });

    toggle?.addEventListener("change", () => {
      // Notify listeners (e.g., maps) that layout changed
      window.dispatchEvent(new CustomEvent("drawer:toggle", { detail: { open: !!toggle.checked } }));
    });

    // Highlight active link in: top nav, drawer, and mobile tabbar (if present)
    const path = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    const menuLinks = document.querySelectorAll(".nav-menu a, .mobile-tabbar .tab-link, .app-nav-menu a");
    menuLinks.forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href && href === path) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle?.checked) closeDrawer();
    });
  } catch (e) {
    // Non-fatal; fail silently if navbar not present
    console.warn("initNavbar() warning:", e);
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