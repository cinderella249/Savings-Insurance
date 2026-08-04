const CACHE_NAME = 'savings-passbook-v2';
const CORE_ASSETS = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match('./index.html'))
      );
    })
  );
});

// 最佳努力：部分瀏覽器（如已安裝於電腦的 Chrome）支援 Periodic Background Sync，
// 可在 App 未開啟時仍定期喚醒檢查繳費日。多數行動瀏覽器不支援，
// 因此主要提醒仍以「開啟 App 時檢查」為主，這裡作為加強、非保證。
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-payments') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'CHECK_PAYMENTS' }));
      })
    );
  }
});
