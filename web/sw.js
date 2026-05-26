const CACHE = "ear-training-20260528a";
const SHELL = ["./", "./index.html", "./app.js", "./styles.css"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(SHELL.map((path) => new URL(path, self.registration.scope).href))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

function shouldCache(url) {
  if (url.origin !== self.location.origin) return false;
  return (
    url.pathname.includes("/samples/") ||
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/sw.js")
  );
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !shouldCache(new URL(event.request.url))) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});
