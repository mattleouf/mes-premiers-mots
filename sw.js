const CACHE_NAME = 'mpm-cache-v3';
const ASSETS = [
  '/',
  'index.html',
  'css/base.css',
  'css/landing.css',
  'js/landing.js',
  'sw-register.js',
  'mode/index.html',
  'mode/css/mode.css',
  'mode/js/mode-select.js',
  'game/index.html',
  'game/css/game.css',
  'game/js/main.mjs',
  'game/js/drag-drop.mjs',
  'game/js/word-check.mjs',
  'game/js/audio.mjs',
  'game/data/words-fr.json',
  'settings/index.html',
  'settings/css/settings.css',
  'settings/js/settings.js',
  'celebration/index.html',
  'celebration/css/celebration.css',
  'celebration/js/celebration.js',
  'js/confetti.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
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
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
