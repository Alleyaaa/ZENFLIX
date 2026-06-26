import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY!
const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  const page = request.nextUrl.searchParams.get('page') || '1'
  const res = await fetch(
    `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=en-US&page=${page}`
  )
  if (!res.ok) return NextResponse.json({ results: [] })
  const data = await res.json()
  return NextResponse.json(data)
}
