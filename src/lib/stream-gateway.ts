/**
 * “Self-hosted look” stream gateway.
 *
 * STRATEGI SUMBER TERSEMBUNYI:
 * Client TIDAK PERNAH melihat domain source (Vidsrc/multiembed/dll).
 * Semua permintaan stream lewat /api/* di server Zenflix:
 *
 *   /api/sources          → daftar channel (hanya index + label, TANPA url)
 *   /api/stream-proxy     → fetch halaman source DI SERVER, rewrite HTML,
 *                           teruskan sebagai iframe /video/embed/:id (path internal)
 *   /api/stream-assets/:id → proxy asset (js/css/img) dari source
 *   /api/resolve-hls      → best-effort ekstrak HLS direct (kualitas manual)
 *
 * Client hanya tahu /video/... → kesannya self-hosted.
 */

export const ZENFLIX_SOURCE_HOSTS = [
  'vidsrcme.ru',
  'vidsrc.to',
  'vidsrc.me',
  'multiembed.mov',
]

export function buildSourceUrl(
  host: string,
  id: string | number,
  type: 'movie' | 'tv',
  season: number,
  episode: number
): string {
  const base = `https://${host}`
  if (type === 'tv') {
    return `${base}/embed/tv/${id}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
  }
  return `${base}/embed/movie/${id}?autoplay=1&ds_lang=id`
}