// Garde l'app en mémoire sur le téléphone pour qu'elle marche sans internet.
const CACHE = 'volleyscore-v14';
const FILES = ['./', './index.html', './matchs.html', './presences.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // La synchronisation Google (lecture/écriture) passe toujours par le réseau, sans cache
  if(e.request.method !== 'GET' || /google(usercontent)?\.com$/.test(url.hostname)) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
