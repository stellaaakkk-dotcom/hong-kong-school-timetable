const CACHE = "hk-teacher-journal-pwa-v230";
const ROOT = new URL("./", self.registration.scope).href;
const CORE = ["./", "./manifest.webmanifest", "./app-icon-192.png", "./app-icon-512.png", "./pdf.worker.min.mjs"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Always prefer the newest version of the enhancement modules.
  const isLiveModule =
    url.pathname.endsWith("/firebase-bootstrap.js") ||
    url.pathname.endsWith("/planner-enhancements.js") ||
    url.pathname.endsWith("/submission-module.js") ||
    url.pathname.endsWith("/submission-module-v224.js") ||
    url.pathname.endsWith("/submission-module-v225.js") ||
    url.pathname.endsWith("/submission-module-v226.js") ||
    url.pathname.endsWith("/submission-module-v227.js") ||
    url.pathname.endsWith("/automate-bridge.js") ||
    url.pathname.endsWith("/seat-score-integrated.html");

  if (isLiveModule) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            caches.open(CACHE).then(cache => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Navigation: network-first, offline fallback to last page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(ROOT, copy));
          return response;
        })
        .catch(() => caches.match(ROOT))
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request).then(response => {
        if (response.ok) {
          caches.open(CACHE).then(cache => cache.put(request, response.clone()));
        }
        return response;
      })
    )
  );
});
