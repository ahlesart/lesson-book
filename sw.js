// The Lesson Book service worker (v17) — NETWORK-FIRST on purpose:
// the live page always wins (version badge stays truthful, updates
// arrive immediately), and the cached copy is only the offline
// fallback for bad barn signal. Never cache-first: a stale pinned
// page is exactly the debugging nightmare this app avoids.
var CACHE = "lessonbook-v17";

self.addEventListener("install", function (e) { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return resp;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
