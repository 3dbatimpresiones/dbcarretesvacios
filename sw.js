// ===== 3DBAT Service Worker — Offline PWA =====
const CACHE = '3dbat-carretes-v2';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './filamentos.js',
  './colaboradores.js',
  './manifest.json',
  './Logo-header.png',
  './favicon-final.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // External URLs (product images, fonts): network first, cache fallback
  if (!url.startsWith(self.location.origin) && !url.startsWith('file://')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  // Local assets: cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      });
    })
  );
});
