const CACHE = "hk-teacher-journal-pwa-v2432";
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
    url.pathname.endsWith("/planner-enhancements-v239.js") ||
    url.pathname.endsWith("/planner-enhancements-v240.js") ||
    url.pathname.endsWith("/planner-enhancements-v241.js") ||
    url.pathname.endsWith("/planner-enhancements-v242.js") ||
    url.pathname.endsWith("/planner-enhancements-v243.js") ||
    url.pathname.endsWith("/planner-enhancements-v244.js") ||
    url.pathname.endsWith("/planner-enhancements-v245.js") ||
    url.pathname.endsWith("/planner-enhancements-v246.js") ||
    url.pathname.endsWith("/planner-enhancements-v247.js") ||
    url.pathname.endsWith("/planner-enhancements-v248.js") ||
    url.pathname.endsWith("/planner-enhancements-v249.js") ||
    url.pathname.endsWith("/planner-enhancements-v2410.js") ||
    url.pathname.endsWith("/planner-enhancements-v2411.js") ||
    url.pathname.endsWith("/planner-enhancements-v2412.js") ||
    url.pathname.endsWith("/planner-enhancements-v2413.js") ||
    url.pathname.endsWith("/planner-enhancements-v2414.js") ||
    url.pathname.endsWith("/planner-enhancements-v2415.js") ||
    url.pathname.endsWith("/planner-enhancements-v2416.js") ||
    url.pathname.endsWith("/planner-enhancements-v2417.js") ||
    url.pathname.endsWith("/planner-enhancements-v2418.js") ||
    url.pathname.endsWith("/planner-enhancements-v2419.js") ||
    url.pathname.endsWith("/planner-enhancements-v2420.js") ||
    url.pathname.endsWith("/planner-enhancements-v2421.js") ||
    url.pathname.endsWith("/planner-enhancements-v2422.js") ||
    url.pathname.endsWith("/planner-enhancements-v2423.js") ||
    url.pathname.endsWith("/planner-enhancements-v2424.js") ||
    url.pathname.endsWith("/planner-enhancements-v2425.js") ||
    url.pathname.endsWith("/planner-enhancements-v2426.js") ||
    url.pathname.endsWith("/planner-enhancements-v2427.js") ||
    url.pathname.endsWith("/planner-enhancements-v2428.js") ||
    url.pathname.endsWith("/planner-enhancements-v2429.js") ||
    url.pathname.endsWith("/planner-enhancements-v2430.js") ||
    url.pathname.endsWith("/planner-enhancements-v2431.js") ||
    url.pathname.endsWith("/planner-enhancements-v2432.js") ||
    url.pathname.endsWith("/submission-module.js") ||
    url.pathname.endsWith("/submission-module-v224.js") ||
    url.pathname.endsWith("/submission-module-v225.js") ||
    url.pathname.endsWith("/submission-module-v226.js") ||
    url.pathname.endsWith("/submission-module-v227.js") ||
    url.pathname.endsWith("/submission-module-v2430.js") ||
    url.pathname.endsWith("/submission-module-v2431.js") ||
    url.pathname.endsWith("/submission-module-v2432.js") ||
    url.pathname.endsWith("/automate-bridge.js") ||
    url.pathname.endsWith("/seat-score-integrated.html") ||
    url.pathname.endsWith("/seat-score-integrated-v239.html") ||
    url.pathname.endsWith("/seat-score-integrated-v240.html") ||
    url.pathname.endsWith("/seat-score-integrated-v241.html") ||
    url.pathname.endsWith("/seat-score-integrated-v242.html") ||
    url.pathname.endsWith("/seat-score-integrated-v243.html") ||
    url.pathname.endsWith("/seat-score-integrated-v244.html") ||
    url.pathname.endsWith("/seat-score-integrated-v245.html") ||
    url.pathname.endsWith("/seat-score-integrated-v246.html") ||
    url.pathname.endsWith("/seat-score-integrated-v247.html") ||
    url.pathname.endsWith("/seat-score-integrated-v248.html") ||
    url.pathname.endsWith("/seat-score-integrated-v249.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2410.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2411.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2412.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2413.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2414.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2415.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2416.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2417.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2418.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2419.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2420.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2421.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2422.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2423.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2424.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2425.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2426.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2427.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2428.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2429.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2430.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2431.html") ||
    url.pathname.endsWith("/seat-score-integrated-v2432.html");

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
