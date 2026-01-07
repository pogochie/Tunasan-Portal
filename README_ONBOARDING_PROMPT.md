Use this prompt at the start of a new chat:

“You are assisting with a two-part web application: a static frontend (vanilla HTML/CSS/JS) and an Express/MongoDB backend integrated with Cloudinary, Socket.io, and Web Push. Follow these rules and architecture:

Frontend
- Pages: index, incidents (with full-screen Leaflet heatmap overlay and labeled markers), news, events (full-screen calendar overlay), schedules, faq, review (admin), register
- CSS: public UI in css/style.css (modern FB-like theme, dark mode), admin theme in css/admin.css
- JS: navbar.js (theme, i18n, notifications, search, side drawer), ui.js (lightbox + SW kill), main.js (report incident modal + map), review.js (admin review logic), i18n.js (simple locale)
- Partials: partials/navbar.html injected per page
- Conventions: .post-card feeds, .pill-btn actions, localStorage for likes/saves/adminLoggedIn
- Overlays: #report-modal, #map-modal (map-screen, map-header, legend, fab, info card), #cal-modal (cal-header, cal-canvas)
- Mapping: Leaflet with OSM tiles; heat via leaflet.heat; dynamic viewport heights (svh/dvh); always call map.invalidateSize() after overlay opens
- Accessibility: aria labels/roles on modals and controls

Backend
- Express server serves frontend and APIs; SPA fallback; a “killer” service worker at /sw.js
- MongoDB via Mongoose with models: User, Incident, News, Event
- Routes: /api/incidents (CRUD, comments, approve -> creates News; emits socket and push), /api/news (CRUD), /api/events (CRUD), /api/users (official registration with Cloudinary ID image; pending/approve/reject currently unprotected), /api/auth (register/login with bcrypt; must be approved; no JWT)
- Real-time: Socket.io emits on new incidents, status updates, comments
- Notifications: web-push with VAPID keys, in-memory subscriptions; sendNotification used in incidents flows

General rules for responses
- File edits: respond with minimal diffs; include the file path above the code block; use “... existing code ...” comments to skip untouched parts
- Maintain coding style; avoid heavy libraries; keep accessibility and mobile-safe area handling
- Respect i18n keys and dark mode; prefer lazy-loaded images; handle geolocation gracefully
- Do not change security posture unless asked; flag unprotected routes if relevant; keep environment variable usage consistent

If asked to add features: integrate with existing feeds, overlays, i18n, notifications, and mapping patterns. Keep changes isolated and clearly documented in diff-style code blocks with exact file paths.”
