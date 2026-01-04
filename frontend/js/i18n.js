// Simple i18n: apply text based on data-i18n and data-i18n-placeholder keys
window.applyLocale = function(locale = "en") {
  const dict = {
    en: {
      "nav.search": "Search...",
      "nav.home": "Home",
      "nav.news": "News",
      "nav.incidents": "Incidents",
      "nav.events": "Events",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Logout",
      "nav.register": "Register",
      "home.title": "Welcome to Barangay Tunasan",
      "home.subtitle": "A connected community portal",
      "home.qrNote": "Scan to open on mobile",
      "home.reportTitle": "Report an Incident",
      "form.name": "Your Name",
      "form.type": "Incident Type",
      "form.description": "Description",
      "form.submit": "Submit Report",
      "notif.title": "Latest updates",
      "pwa.install": "Install App",
      "incidents.title": "Recent Incidents",
      "incidents.nearbyTitle": "Incidents near you",
      "incidents.within": "incident(s) within 1 km.",
      "incidents.heatmapTitle": "Heatmap Controls",
      "incidents.showHeatmap": "Show heatmap",
      "incidents.radius": "Radius",
      "incidents.blur": "Blur",
      "incidents.max": "Max intensity",
      "incidents.fit": "Fit to incidents",
      "events.title": "Upcoming Events"
    },
    fil: {
      "nav.search": "Maghanap...",
      "nav.home": "Home",
      "nav.news": "Balita",
      "nav.incidents": "Insidente",
      "nav.events": "Mga Kaganapan",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Logout",
      "nav.register": "Rehistro",
      "home.title": "Maligayang Pagdating sa Barangay Tunasan",
      "home.subtitle": "Isang konektadong community portal",
      "home.qrNote": "I-scan para buksan sa mobile",
      "home.reportTitle": "Mag-ulat ng Insidente",
      "form.name": "Iyong Pangalan",
      "form.type": "Uri ng Insidente",
      "form.description": "Paglalarawan",
      "form.submit": "Isumite ang Ulat",
      "notif.title": "Pinakabagong update",
      "pwa.install": "I-install ang App",
      "incidents.title": "Mga Kamakailang Insidente",
      "incidents.nearbyTitle": "Mga insidente malapit sa iyo",
      "incidents.within": "insidente sa loob ng 1 km.",
      "incidents.heatmapTitle": "Mga Kontrol ng Heatmap",
      "incidents.showHeatmap": "Ipakita ang heatmap",
      "incidents.radius": "Radius",
      "incidents.blur": "Blur",
      "incidents.max": "Maks na tindi",
      "incidents.fit": "I-fit sa mga insidente",
      "events.title": "Paparating na mga Kaganapan"
    }
  };
  const lang = dict[locale] || dict.en;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (lang[key]) el.textContent = lang[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (lang[key]) el.setAttribute("placeholder", lang[key]);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const pairs = el.getAttribute("data-i18n-attr").split(",");
    pairs.forEach(p => {
      const [attr, key] = p.split(":");
      if (lang[key]) el.setAttribute(attr.trim(), lang[key]);
    });
  });
};
// Apply saved or default locale
window.applyLocale(localStorage.getItem("locale") || "en");
