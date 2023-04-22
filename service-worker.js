const cacheName = 'my-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/image.png',
  '/icons/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Opened cache');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
