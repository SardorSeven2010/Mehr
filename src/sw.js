/* MEHR service worker — ilovani oflayn işlatiş uçun.
   Bu fayl build paytida dist/sw.js ga yoziladi (vite.config.js ga qarang). */
const VERSION = '__MEHR_VERSION__';
const PRECACHE = `mehr-precache-${VERSION}`;
const RUNTIME = 'mehr-runtime-v1';
const PRECACHE_URLS = self.__MEHR_PRECACHE__;
const RUNTIME_LIMIT = 80;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PRECACHE && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trimRuntime() {
  const cache = await caches.open(RUNTIME);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - RUNTIME_LIMIT; i++) await cache.delete(keys[i]);
}

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PRECACHE);
      cache.put('index.html', response.clone());
    }
    return response;
  } catch {
    return (await caches.match('index.html')) || Response.error();
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request, { ignoreSearch: request.url.startsWith(self.location.origin) });
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(RUNTIME);
      await cache.put(request, response.clone());
      trimRuntime();
    }
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }
  if (url.origin === self.location.origin || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirst(request));
  }
});
