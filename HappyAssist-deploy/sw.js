// CAE Secretary — service worker (network-first, cache fallback for offline)
const CACHE = 'cae-secretary-v1';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  // only cache the app shell + CDN libs; API calls always go to network
  const cacheable = u.origin === location.origin || u.hostname === 'cdnjs.cloudflare.com';
  if (!cacheable) return;
  e.respondWith(
    caches.open(CACHE).then(async c => {
      try {
        const r = await fetch(e.request);
        if (r.ok) c.put(e.request, r.clone());
        return r;
      } catch (err) {
        const m = await c.match(e.request);
        if (m) return m;
        throw err;
      }
    })
  );
});
