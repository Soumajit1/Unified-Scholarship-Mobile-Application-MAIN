self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // A simple pass-through fetch handler is required by Chrome to trigger the install prompt
  event.respondWith(fetch(event.request).catch(() => new Response("Offline Mode")));
});
