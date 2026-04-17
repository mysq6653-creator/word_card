const CACHE_NAME = 'word-card-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // For navigation requests (HTML pages), use network-first and
  // always serve index.html (SPA with client-side routing).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch('/').then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
        return response;
      }).catch(() => caches.match('/'))
    );
    return;
  }

  // For static assets (JS, CSS, images): network-first with cache fallback.
  event.respondWith(
    fetch(request).then((response) => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    }).catch(() => caches.match(request))
  );
});
