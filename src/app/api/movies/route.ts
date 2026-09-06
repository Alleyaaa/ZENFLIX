const TMDB_KEY = process.env.TMDB_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

interface MovieRow {
  tmdb_id: number
  title: string
  year: number | null
  poster_url: string | null
  backdrop_url: string | null
  rating: number
  embed_url: string
}

const PAGE_SIZE = 30
const TMDB_BASE = 'https://api.themoviedb.org/3'

const CATEGORIES: Record<string, string> = {
  now_playing: '/movie/now_playing',
  popular: '/movie/popular',
  top_rated: '/movie/top_rated',
  upcoming: '/movie/upcoming',
  trending: '/trending/movie/week',
}

async function fetchMoviesFromSupabase(order: string, limit = PAGE_SIZE, offset = 0): Promise<MovieRow[]> {
  if (!SUPABASE_URL || !SERVICE_KEY) return []
  const url = `${SUPABASE_URL}/rest/v1/movies?select=*&order=${order}&limit=${limit}&offset=${offset}`
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

interface TMDBResult {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: string
}

function toMovieRow(m: TMDBResult): MovieRow {
  return {
    tmdb_id: m.id,
    title: m.title || m.name || 'Untitled',
    year: Number((m.release_date || m.first_air_date || '').split('-')[0]) || null,
    poster_url: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
    rating: m.vote_average || 0,
    embed_url: `https://vidsrc.xyz/embed/movie/tmdb/${m.id}`,
  }
}

async function fetchMoviesFromTMDB(category: string, page = 1): Promise<MovieRow[]> {
  if (!TMDB_KEY) return []
  const path = CATEGORIES[category] || CATEGORIES.popular
  const url = `${TMDB_BASE}${path}?api_key=${TMDB_KEY}&language=id-ID&page=${page}`
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map(toMovieRow)
  } catch {
    return []
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''

  // Kalau ada category → langsung TMDB (source of truth untuk film)
  if (category) {
    const rows = await fetchMoviesFromTMDB(category, page)
    return Response.json({ results: rows, source: 'tmdb' })
  }

  // Tanpa category → coba Supabase dulu, fallback ke TMDB popular
  const offset = (page - 1) * PAGE_SIZE
  const dbRows = await fetchMoviesFromSupabase('year.desc', PAGE_SIZE, offset)
  if (dbRows.length > 0) {
    return Response.json({ results: dbRows, source: 'supabase' })
  }
  const tmdbRows = await fetchMoviesFromTMDB('popular', page)
  return Response.json({ results: tmdbRows, source: 'tmdb' })
}