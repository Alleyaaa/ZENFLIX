import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY!
const TMDB_BASE = 'https://api.themoviedb.org/3'

const CATEGORIES = [
  { path: '/movie/popular', pages: 100 },
  { path: '/movie/top_rated', pages: 50 },
  { path: '/movie/now_playing', pages: 10 },
  { path: '/movie/upcoming', pages: 5 },
  { path: '/trending/movie/week', pages: 5 },
  { path: '/discover/movie?vote_count.gte=500&sort_by=vote_average.desc', pages: 30 },
  { path: '/discover/movie?sort_by=popularity.desc&primary_release_date.gte=2025', pages: 30 },
  { path: '/discover/movie?with_original_language=en&sort_by=popularity.desc', pages: 30 },
  { path: '/discover/movie?with_original_language=en&sort_by=revenue.desc&primary_release_date.gte=2000', pages: 20 },
  { path: '/discover/movie?with_original_language=ja&sort_by=popularity.desc', pages: 20 },
  { path: '/discover/movie?with_original_language=ko&sort_by=popularity.desc', pages: 20 },
  { path: '/discover/movie?with_original_language=hi&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/movie?with_original_language=zh&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/movie?with_original_language=th&sort_by=popularity.desc', pages: 5 },
  { path: '/discover/movie?with_original_language=id&sort_by=popularity.desc', pages: 5 },
  { path: '/discover/movie?with_original_language=fr&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/movie?with_original_language=de&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/movie?with_original_language=es&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/movie?with_original_language=pt&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/movie?with_original_language=ru&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/movie?with_original_language=ar&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/movie?with_original_language=tl&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/movie?with_original_language=it&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/movie?with_original_language=vi&sort_by=popularity.desc', pages: 10 },
  // TV
  { path: '/trending/tv/week', pages: 5 },
  { path: '/tv/popular', pages: 50 },
  { path: '/tv/top_rated', pages: 30 },
  { path: '/discover/tv?vote_count.gte=200&sort_by=vote_average.desc', pages: 20 },
  { path: '/discover/tv?with_original_language=en&sort_by=popularity.desc', pages: 20 },
  { path: '/discover/tv?with_original_language=ja&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/tv?with_original_language=ko&sort_by=popularity.desc', pages: 15 },
  { path: '/discover/tv?with_original_language=hi&sort_by=popularity.desc', pages: 10 },
  { path: '/discover/tv?with_original_language=id&sort_by=popularity.desc', pages: 5 },
]

interface MovieRow {
  tmdb_id: number
  title: string
  year: number | null
  poster_url: string | null
  backdrop_url: string | null
  rating: number
  original_language: string
  media_type: string
  embed_url: string
}

function tmdbUrl(path: string, page: number): string {
  const sep = path.includes('?') ? '&' : '?'
  return `${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}&page=${page}`
}

async function fetchPage(path: string, page: number): Promise<MovieRow[]> {
  const res = await fetch(tmdbUrl(path, page))
  if (!res.ok) return []
  const data = await res.json()
  if (!data.results?.length) return []
  return data.results
    .filter((m: any) => m.id && (m.title || m.name))
    .map((m: any) => {
      const isTV = path.includes('/tv')
      const lang = m.original_language || 'en'
      const mt = isTV ? 'tv' : 'movie'
      return {
        tmdb_id: m.id,
        title: m.title || m.name || 'Unknown',
        year: m.release_date ? parseInt(m.release_date.split('-')[0]) : m.first_air_date ? parseInt(m.first_air_date.split('-')[0]) : null,
        poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
        backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
        rating: m.vote_average || 0,
        original_language: lang,
        media_type: mt,
        embed_url: isTV
          ? `https://vidsrc-embed.ru/embed/tv?tmdb=${m.id}&autoplay=1&autonext=1`
          : `https://vidsrc-embed.ru/embed/movie?tmdb=${m.id}&autoplay=1`,
      }
    })
}

export async function GET(request: NextRequest) {
  // ─── ADMIN_TOKEN guard (A01: Broken Access Control) ───
  // Fail-closed: tanpa header x-admin-token yang benar, endpoint TERTUTUP.
  const adminToken = process.env.ADMIN_TOKEN
  const provided = request.headers.get('x-admin-token') || ''
  if (!adminToken || provided !== adminToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const seen = new Set<number>()
  const allMovies: MovieRow[] = []

  for (const cat of CATEGORIES) {
    for (let page = 1; page <= cat.pages; page++) {
      const movies = await fetchPage(cat.path, page)
      if (!movies.length) break
      for (const m of movies) {
        if (seen.has(m.tmdb_id)) continue
        seen.add(m.tmdb_id)
        allMovies.push(m)
      }
    }
  }

  let seeded = 0, errors = 0, batches = 0
  for (let i = 0; i < allMovies.length; i += 20) {
    const batch = allMovies.slice(i, i + 20)
    const body = JSON.stringify(batch)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/movies?on_conflict=tmdb_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body,
    })
    batches++
    if (!res.ok) {
      const text = await res.text()
      console.error(`Batch ${i} error:`, text.slice(0, 200))
      errors += batch.length
    } else {
      seeded += batch.length
    }
  }

  return NextResponse.json({
    seeded,
    errors,
    batches,
    total_unique: allMovies.length,
    sources: CATEGORIES.length,
    message: 'Database updated!',
  })
}
