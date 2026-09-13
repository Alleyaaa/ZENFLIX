// Lightweight API cache: in-memory TTL cache with optional Redis (Upstash) support.
// Pasang UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN utk Redis terdistribusi,
// atau biarkan kosong → fallback ke Map in-memory (per instance).

type CacheEntry<T> = { value: T; expiresAt: number }

const memoryCache = new Map<string, CacheEntry<unknown>>()

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

export async function cacheGet<T>(key: string): Promise<T | null> {
  // Redis path
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const res = await fetch(`${REDIS_URL}/get/${key}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      })
      if (res.ok) {
        const data = await res.json()
        return (data.result as T) ?? null
      }
    } catch { /* fallback to memory */ }
  }
  // Memory path
  const entry = memoryCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key)
    return null
  }
  return entry.value as T
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  // Redis path
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const res = await fetch(`${REDIS_URL}/set/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REDIS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(value),
      })
      if (res.ok) {
        await fetch(`${REDIS_URL}/expire/${key}/${ttlSeconds}`, {
          headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
        }).catch(() => {})
        return
      }
    } catch { /* fallback */ }
  }
  // Memory path
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cacheDelete(key: string): Promise<void> {
  memoryCache.delete(key)
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await fetch(`${REDIS_URL}/del/${key}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      }).catch(() => {})
    } catch { /* noop */ }
  }
}

// Helper: cached fetch wrapper
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached
  const fresh = await fetcher()
  await cacheSet(key, fresh, ttlSeconds)
  return fresh
}