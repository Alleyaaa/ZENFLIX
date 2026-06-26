import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET() {
  let seeded = 0, errors = 0
  const errDetails: string[] = []

  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${TMDB_BASE}/movie/popular?api_key=${TMDB_KEY}&language=en-US&page=${page}`)
    if (!res.ok) { errors++; continue }
    const data: any = await res.json()

    for (const movie of data.results) {
      const embedUrl = `https://vidsrc-embed.ru/embed/movie?tmdb=${movie.id}&autoplay=1`
      const poster = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
      const body = JSON.stringify({
        tmdb_id: movie.id,
        title: movie.title,
        year: movie.release_date?.split('-')[0] ?? null,
        poster_url: poster,
        embed_url: embedUrl,
      })
      const upsert = await fetch(`${SUPABASE_URL}/rest/v1/movies?on_conflict=tmdb_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body,
      })
      if (!upsert.ok) {
        const text = await upsert.text()
        errDetails.push(`${movie.id}: ${upsert.status} ${text.slice(0, 100)}`)
        errors++
      } else {
        seeded++
      }
    }
  }
  return NextResponse.json({ seeded, errors, details: errDetails.slice(0, 5) })
}
