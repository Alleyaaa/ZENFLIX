// Service Worker for Zenflix PWA
const CACHE_NAME = 'zenflix-v2'
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: stale-while-revalidate for navigation, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET
  if (request.method !== 'GET') return

  // Skip external (TMDB, Supabase, etc)
  if (url.origin !== location.origin) return

  // HTML navigation: network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    )
    return
  }

  // Static assets: cache-first
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networked = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone()
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
            }
            return response
          })
          .catch(() => cached)
        return cached || networked
      })
    )
    return
  }

  // API: network-only (no caching)
  if (url.pathname.startsWith('/api/')) return

  // Default: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  )
})

// Background sync for offline actions (future)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-watchlist') {
    event.waitUntil(syncWatchlist())
  }
})

async function syncWatchlist() {
  // Implement when needed
  console.log('Background sync triggered')
}