const cacheName = 'my-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/images/services-seo-image.webp',
  '/icons/favicon.ico'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(filesToCache);
      })
      .catch(error => {
        console.error('Failed to open cache:', error);
      })
  );
});

// Fetch resources from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch and cache new resources from network
        return fetch(event.request)
          .then(networkResponse => {
            // Check if fetched response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response for both cache and browser consumption
            const responseToCache = networkResponse.clone();

            // Open cache and store the new response
            caches.open(cacheName)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('Failed to fetch resource:', error);
            // Optionally return a custom offline page here
          });
      })
  );
});
