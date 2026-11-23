// СЧ Помощь — работа без интернета. При изменении файлов увеличьте номер версии.
const VERSION = "sch-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Сначала из памяти телефона (мгновенно, даже при глушении), в фоне — обновление, если есть сеть.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const key = e.request.mode === "navigate" ? "index.html" : e.request;
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => { if (r.ok) cache.put(key, r.clone()); return r; }).catch(() => null);
    return cached || (await fresh) || new Response("Нет сети", { status: 503 });
  }));
});
