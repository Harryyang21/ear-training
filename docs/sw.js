const CACHE = "ear-training-2.1.5";
const SHELL = ["index.html", "stats.html", "app.js", "stats.js", "stats-storage.js", "styles.css"];

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
    url.pathname.endsWith("/stats.js") ||
    url.pathname.endsWith("/stats-storage.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/stats.html")
  );
}

function isServiceWorkerRequest(url) {
  return url.pathname.endsWith("/sw.js");
}

async function matchCached(cache, request) {
  let hit = await cache.match(request, { ignoreSearch: true });
  if (hit) return hit;

  const pathname = new URL(request.url).pathname;
  const keys = await cache.keys();
  const alt = keys.find((entry) => new URL(entry.url).pathname === pathname);
  return alt ? cache.match(alt) : null;
}

async function networkFirstShell(cache, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await matchCached(cache, request);
    if (cached) return cached;
    throw new Error("offline");
  }
}

async function cacheFirstSample(cache, request) {
  const cached = await matchCached(cache, request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isServiceWorkerRequest(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isSampleRequest(url)) {
    event.respondWith(caches.open(CACHE).then((cache) => cacheFirstSample(cache, event.request)));
    return;
  }

  if (isShellRequest(url)) {
    event.respondWith(caches.open(CACHE).then((cache) => networkFirstShell(cache, event.request)));
  }
});
