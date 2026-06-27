import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const tmdbId = request.nextUrl.searchParams.get('tmdb_id')
  if (!tmdbId) return NextResponse.json({ error: 'tmdb_id required' }, { status: 400 })

  const TMDB_KEY = process.env.TMDB_API_KEY!
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/videos?api_key=${TMDB_KEY}&language=en-US`
    )
    const data = await res.json()
    const trailer = data.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
    return NextResponse.json({ key: trailer?.key || null })
  } catch {
    return NextResponse.json({ key: null })
  }
}