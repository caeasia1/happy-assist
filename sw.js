// Happy Assist — service worker (network-first for HTML, cache fallback for offline)
const CACHE = 'happy-assist-v7';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  // ลบ cache เก่าทุกเวอร์ชันที่ไม่ใช่ปัจจุบัน → บังคับให้ได้ไฟล์ใหม่หลังอัปเดต
  const keys = await caches.keys();
  await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  await clients.claim();
})()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const cacheable = u.origin === location.origin || u.hostname === 'cdnjs.cloudflare.com' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (!cacheable) return;
  // เอกสารหลัก (HTML/นำทาง): network-first เสมอ เพื่อให้ได้เวอร์ชันล่าสุด
  e.respondWith(
    caches.open(CACHE).then(async c => {
      try {
        const r = await fetch(e.request, { cache: 'no-store' });
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
