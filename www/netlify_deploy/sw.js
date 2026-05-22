const CACHE_NAME = 'minhas-despesas-v13';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './js/app.js',
  './js/db.js',
  './boas_vindas/code.html',
  './dashboard_de_despesas/code.html',
  './adicionar_despesa/code.html',
  './hist_rico_e_exporta_o/code.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se encontrar no cache, retorna. Senão, tenta a rede.
      return response || fetch(event.request);
    }).catch(() => {
      // Opcionalmente, pode retornar uma tela de fallback offline se tudo falhar
    })
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
