const VERSION = "v2"; // increment version to force cache update
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const STATIC_ASSETS = [
  "/", "/index.html", "/incidents.html", "/news.html", "/events.html",
  "/css/style.css", "/js/navbar.js", "/js/ui.js", "/js/i18n.js", "/js/main.js",
  "https://unpkg.com/leaflet@1.9.3/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.3/dist/leaflet.js",
  "https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (![STATIC_CACHE, RUNTIME_CACHE].includes(k)) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

// Network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin && (url.pathname.startsWith("/api/") || url.pathname.startsWith("/uploads/"))) {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
      const clone = res.clone();
      caches.open(RUNTIME_CACHE).then(cache => cache.put(event.request, clone));
      return res;
    }))
  );
});

// Push notifications (retain your existing behavior)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || { title: "Update", body: "", url: "/" };
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: data.url
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});
