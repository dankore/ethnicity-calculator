const cacheName = 'ethncity-cal-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js'
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

// Caching .png and .webp images from the icons and images directories
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Check if the request is for a .png file in the /icons or /images directory, or a .webp file in the /images directory
  if ((url.pathname.startsWith('/icons/') && url.pathname.endsWith('.png')) ||
      (url.pathname.startsWith('/images/') && (url.pathname.endsWith('.png') || url.pathname.endsWith('.webp')))) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then(networkResponse => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }
            const responseToCache = networkResponse.clone();
            caches.open(cacheName)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          });
        })
    );
  }
});
