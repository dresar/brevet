// Brevet AB Hub — Ultra-Optimized Offline Service Worker (v4)
const CACHE_NAME = 'brevet-ab-v4';
const RUNTIME_CACHE = 'brevet-runtime-v4';
const DATA_CACHE = 'brevet-data-v4';

// Core Application Shells to Pre-cache on Install
const PRECACHE_ASSETS = [
  '/',
  '/belajar',
  '/tools/kalkulator',
  '/ujian-djp',
  '/belajar/simulasi-djp',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/icon.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// 1. Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-fatal warning:', err);
      });
    })
  );
});

// 2. Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (
              name !== CACHE_NAME &&
              name !== RUNTIME_CACHE &&
              name !== DATA_CACHE
            ) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Bulletproof with Guaranteed Response Objects
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only intercept GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip non-http(s) or browser internal requests
  if (!url.protocol.startsWith('http')) return;

  // Bypass admin, auth, and keys management directly to network
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/keys') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/ai')
  ) {
    return; // Let browser handle natively
  }

  // Strategy A: Next.js Static Bundles, Fonts, Icons, SVGs -> Cache-First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const clone = res.clone();
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, clone));
            }
            return res;
          })
          .catch(() => new Response('', { status: 408 }));
      })
    );
    return;
  }

  // Strategy B: Data APIs -> Stale-While-Revalidate
  if (
    url.pathname.startsWith('/api/belajar') ||
    url.pathname.startsWith('/api/djp-exam') ||
    url.pathname.startsWith('/api/admin/glossary')
  ) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const networkFetch = fetch(req)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              cache.put(req, networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          }));

        return cached || networkFetch;
      })
    );
    return;
  }

  // Strategy C: HTML Pages -> Network-First with Safe Fallback
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
          if (url.pathname.startsWith('/tools')) {
            const toolCache = await caches.match('/tools/kalkulator');
            if (toolCache) return toolCache;
          }
          if (url.pathname.startsWith('/ujian')) {
            const examCache = await caches.match('/ujian-djp');
            if (examCache) return examCache;
          }
          const belajarCache = await caches.match('/belajar');
          if (belajarCache) return belajarCache;
          const rootCache = await caches.match('/');
          if (rootCache) return rootCache;
        }

        return new Response('Halaman sedang offline.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      })
  );
});
