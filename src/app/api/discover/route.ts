import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

// TMDB hard-caps 20 results per page.
// Untuk limit 24/36/48/60, kita fetch beberapa halaman TMDB lalu slice window yang diminta.
// Page P (user-facing) = window limit items mulai dari offset (P-1)*limit.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'movie'
  const genreId = searchParams.get('genre')
  const year = searchParams.get('year')
  const country = searchParams.get('country')
  const networkId = searchParams.get('network')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const sort = searchParams.get('sort') || 'popularity.desc'
  const limit = Math.min(120, Math.max(1, parseInt(searchParams.get('limit') || '20')))

  if (!TMDB_KEY) {
    return NextResponse.json({ error: 'Missing TMDB key' }, { status: 500 })
  }

  const buildParams = (p: number) => {
    const params = new URLSearchParams({
      api_key: TMDB_KEY,
      language: 'id-ID',
      page: p.toString(),
      sort_by: sort,
      include_adult: 'false',
      include_video: 'false',
    })
    if (type === 'tv') params.set('with_type', '0')
    if (genreId) params.set('with_genres', genreId)
    if (year) params.set(type === 'tv' ? 'first_air_date_year' : 'primary_release_year', year)
    if (country) params.set('with_origin_country', country)
    if (networkId) params.set('with_networks', networkId)
    return params
  }

  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie'

  try {
    // Hitung window: offset = (page-1)*limit, kita butuh item offset..offset+limit
    const offset = (page - 1) * limit
    const tmdbStartPage = Math.floor(offset / 20) + 1
    const tmdbEndPage = Math.ceil((offset + limit) / 20)

    // Fetch semua TMDB pages yang diperlukan (max 6 untuk limit 120)
    const promises: Promise<{ results: any[]; total_pages: number; total_results: number }>[] = []
    for (let p = tmdbStartPage; p <= tmdbEndPage && p <= 500; p++) {
      promises.push(
        fetch(`${TMDB_BASE}${endpoint}?${buildParams(p)}`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(12000),
        }).then(res => res.ok ? res.json() : { results: [], total_pages: 1, total_results: 0 })
      )
    }

    const datas = await Promise.all(promises)
    const allResults: any[] = []
    let totalTMDBResults = 0
    for (const d of datas) {
      allResults.push(...(d.results || []))
      totalTMDBResults = Math.max(totalTMDBResults, d.total_results || 0)
    }

    // Slice window yang diminta
    const localOffset = offset - (tmdbStartPage - 1) * 20
    const results = allResults.slice(localOffset, localOffset + limit)

    // total_pages dalam unit user-facing (limit per halaman)
    const totalPages = totalTMDBResults > 0 ? Math.min(Math.ceil(totalTMDBResults / limit), 500) : 1

    return NextResponse.json({
      results,
      page,
      total_pages: totalPages,
      total_results: totalTMDBResults,
      limit,
    })
  } catch {
    return NextResponse.json({ results: [], error: 'Failed to fetch' }, { status: 500 })
  }
}