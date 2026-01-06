// Simple admin auth state using localStorage (for demo only)
export function initNavbar() {
  const adminLink = document.getElementById("admin-link");
  const logoutLink = document.getElementById("logout-link");
  const navToggle = document.getElementById("nav-toggle");
  const overlay = document.querySelector(".nav-overlay");
  const navMenu = document.querySelector(".nav-menu");
  const moreItem = navMenu?.querySelector(".more");
  const moreMenu = document.getElementById("more-menu");
  const moreBtn = moreItem?.querySelector(".more-btn");
  const notifBadge = document.getElementById("notif-badge");

  function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    if (adminLink) adminLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = isLoggedIn ? "inline-block" : "none";
  }
  checkAdminAuth();

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      checkAdminAuth();
      window.location.href = "index.html";
    });
  }

  // Mobile drawer
  if (navToggle && overlay && navMenu) {
    overlay.addEventListener("click", () => (navToggle.checked = false));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") navToggle.checked = false;
    });
  }

  // Notifications demo badge update (you can wire to real socket later)
  if (notifBtn && notifBadge) {
    notifBtn.addEventListener("click", () => {
      notifBadge.hidden = true;
    });
    // Example: show random count on load
    const count = Math.floor(Math.random() * 3);
    if (count > 0) {
      notifBadge.textContent = String(count);
      notifBadge.hidden = false;
    }
  }

  // Responsive overflow: move excess items into "More" dropdown
  function fitNav() {
    if (!navMenu || !moreItem || !moreMenu) return;
    // Reset: move all items back except .more
    const items = Array.from(moreMenu.children);
    items.forEach(li => navMenu.insertBefore(li, moreItem));

    // Reserve space for utilities; measure available width
    const container = navMenu.parentElement;
    const available = container.clientWidth - (container.querySelector(".nav-utilities")?.clientWidth || 0) - 32;

    // Move trailing items into "More" until it fits
    let overflows = navMenu.scrollWidth > available;
    const movable = () => Array.from(navMenu.children).filter(li => !li.classList.contains("more"));
    while (overflows && movable().length > 0) {
      const toMove = movable().pop();
      if (!toMove) break;
      moreMenu.insertBefore(toMove, moreMenu.firstChild);
      overflows = navMenu.scrollWidth > available;
    }

    // Toggle visibility of "More"
    moreItem.style.display = moreMenu.children.length ? "inline-block" : "none";
  }

  // Toggle "More" dropdown
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", () => {
      const expanded = moreBtn.getAttribute("aria-expanded") === "true";
      moreBtn.setAttribute("aria-expanded", (!expanded).toString());
      moreMenu.classList.toggle("open", !expanded);
    });
    document.addEventListener("click", (e) => {
      if (!moreItem.contains(e.target)) {
        moreBtn.setAttribute("aria-expanded", "false");
        moreMenu.classList.remove("open");
      }
    });
  }

  window.addEventListener("resize", fitNav);
  // Run once after layout
  setTimeout(fitNav, 0);


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
      }
      else if (noMsg) {
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