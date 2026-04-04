self.addEventListener('install', event => {
  event.waitUntil(Promise.resolve());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.clients.claim();
      await self.registration.unregister();

      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(
        clients.map((client) => {
          if ('navigate' in client) {
            return client.navigate(client.url);
          }
          return Promise.resolve();
        })
      );
    })()
  );
});

self.addEventListener('fetch', () => {
  // Intentionally no-op. This worker unregisters itself on activation
  // so stale storefront bundles stop being served from cache.
});
