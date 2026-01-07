Project: Barangay Tunasan Web App – Frontend Architecture Onboarding Prompt

You are assisting with a static frontend served by an Express backend. The UI is built with vanilla HTML, CSS, and minimal JS modules. Mapping uses Leaflet. Images are displayed with a lightbox. The app supports a Facebook-like theme with a sticky top navbar and a mobile bottom tabbar. This prompt describes how to work within the frontend.

Tech and structure
- HTML pages under /frontend: index.html, incidents.html, news.html, events.html, schedules.html, faq.html, review.html, register.html
- Styles: css/style.css (public UI theme), css/admin.css (admin theme)
- JS modules:
  - js/navbar.js: navbar init, theme toggle, language toggle, notifications, global search, PWA install, side drawer
  - js/ui.js: global lightbox, service worker unregister logic
  - js/main.js: report incident modal/map logic on index.html
  - js/review.js: admin review page (map + details + comments)
  - js/i18n.js: simple i18n via data-i18n attributes
- Partials: partials/navbar.html is injected into each page and then initNavbar() runs

Key UI patterns
- Cards: .post-card lists for News/Incidents/Events
- Buttons: .pill-btn and .icon-btn classes for actions
- Feeds: ul.feed containers with li.post-card items (like, save, share interactions via localStorage)
- Overlays:
  - Report Incident modal on index.html (#report-modal with .report-section form and Leaflet #map)
  - Full-screen Incidents Map overlay on incidents.html (#map-modal, #map-screen, .map-header, .map-legend, .map-fab, .map-info-card)
  - Full-screen Calendar overlay on events.html (#cal-modal, .cal-header, .cal-canvas)
- Mobile: .mobile-tabbar fixed at bottom; safe-area handling via env(safe-area-inset-*). Dynamic viewport heights (100svh/100dvh) are used in overlay canvases

Mapping (Leaflet)
- index.html uses L.map("map") inside the report modal for selecting lat/lng (stored in hidden inputs location[lat]/[lng])
- incidents.html uses a full-screen overlay:
  - L.map("map-screen") with OSM tiles
  - Heatmap via leaflet.heat (L.heatLayer)
  - Labeled markers using L.divIcon () with inline type chips
  - Floating info card shows incident details on marker click
  - Legend chips show incident type counts
  - Locate-me FAB uses navigator.geolocation to place a “You are here” marker/circle
- Ensure map.invalidateSize() after layout changes (modal open, resize, side drawer toggles)

Internationalization
- i18n keys in js/i18n.js populate elements with [data-i18n], [data-i18n-placeholder], or [data-i18n-attr]
- Keep keys consistent when adding new labels; default languages: en, fil

Notifications and search (frontend UX)
- Navbar notification center fetches /api/news and /api/incidents; shows latest items and a badge count
- Global search filters .post-card items in any feed (#home-feed, #news-list, #incidents-list) and injects a .no-results card
- Likes and saves are stored in localStorage with namespaced keys

Service worker
- The backend serves a “killer” SW at /sw.js; ui.js also unregisters any SW and clears caches on load

Styling and theming
- css/style.css defines a modern theme with variables: --bg, --card, --text, --muted, --primary, etc.
- Dark theme via .theme-dark on html root; navbar.js toggles theme and swaps icons
- Background image layer (body::before) and a light overlay (body::after) for contrast

Frontend conventions to follow
- Editing rules: when requested to change files, respond with minimal diff blocks:
  - Always include file path before the code block
  - Show only changed/new parts with “... existing code ...” comments between edits when necessary
- Prefer vanilla HTML/CSS/JS; keep dependencies minimal
- Keep accessibility: aria-labels/roles on overlays, buttons, and feeds
- Use env(safe-area-inset-*) and dynamic viewport units (svh/dvh) to ensure overlays are truly full screen on mobile
- Use localStorage for simple client-side states (likes, saves, adminLoggedIn)
- Do not introduce heavy frameworks; match existing coding style and patterns

Pages overview
- index.html: Landing page with QR, feature carousel, community feed, and Report Incident modal (Leaflet)
- incidents.html: Approved incidents feed + full-screen map overlay with heatmap, markers, legend, FAB, info card
- news.html: News feed with like interactions
- events.html: Events feed + full-screen calendar overlay; ICS export for each event
- schedules.html, faq.html: Static demo pages (QR included)
- review.html: Admin incident review page (map + images + comments) using js/review.js

Performance and UX notes
- Use loading="lazy" and decoding="async" on images
- Defer map size invalidation slightly (setTimeout) after overlay open
- Handle geolocation errors gracefully
- Keep overlays non-blocking of underlying content; lock body scroll only when modal is open

If adding new UI features
- Follow .post-card, .pill-btn, .icon-btn, and feed conventions
- Respect i18n and dark mode
- Prefer overlays that are fixed and use header/footer chrome consistent with existing (.map-header/.cal-header)
- Integrate with existing navbar notification and search UX where applicable
