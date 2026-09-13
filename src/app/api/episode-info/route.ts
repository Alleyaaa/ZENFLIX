import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY

export async function GET(request: NextRequest) {
  const tvId = parseInt(request.nextUrl.searchParams.get('id') || '0')
  const season = parseInt(request.nextUrl.searchParams.get('season') || '1')
  if (!tvId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tvId}/season/${season}?api_key=${TMDB_KEY}&language=id-ID`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return NextResponse.json({ episodes: [] })
    const data = await res.json()
    const episodes = (data.episodes || []).map((ep: any) => ({
      id: ep.episode_number,
      name: ep.name || '',
      overview: ep.overview || '',
      still: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
      runtime: ep.runtime || null,
      air_date: ep.air_date || null,
      vote_average: ep.vote_average || 0,
    }))
    return NextResponse.json({ season: data.season_number, name: data.name, episodes })
  } catch {
    return NextResponse.json({ episodes: [] })
  }
}
