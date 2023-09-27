self.addEventListener("install", () => {
    console.log("[ServiceWorker] Install")
})

self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request));
});

self.addEventListener("activate", () => {
    console.log("[ServiceWorker] Activate");
  });