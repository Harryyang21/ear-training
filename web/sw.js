const CACHE = "ear-training-20260530i";
const SHELL = ["index.html", "app.js", "styles.css", "sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      const base = self.registration.scope;
      await Promise.allSettled(SHELL.map((file) => cache.add(new URL(file, base).href)));
    })
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

function isSampleRequest(url) {
  return url.pathname.includes("/samples/");
}

function isShellRequest(url) {
  return (
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/sw.js")
  );
}

async function matchCached(cache, request) {
  let hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;

  const pathname = new URL(request.url).pathname;
  const keys = await cache.keys();
  const alt = keys.find((entry) => new URL(entry.url).pathname === pathname);
  return alt ? cache.match(alt) : null;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (!isSampleRequest(url) && !isShellRequest(url)) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await matchCached(cache, event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});
