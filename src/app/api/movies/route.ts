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

async function fetchMovies(order: string, limit = PAGE_SIZE, offset = 0): Promise<MovieRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/movies?select=*&order=${order}&limit=${limit}&offset=${offset}`
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) return []
  return res.json()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * PAGE_SIZE
  const data = await fetchMovies('year.desc', PAGE_SIZE, offset)
  return Response.json({ results: data })
}
