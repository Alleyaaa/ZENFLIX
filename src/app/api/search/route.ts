import { NextResponse } from 'next/server'
import { searchMovies } from '@/lib/tmdb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const movies = await searchMovies(query)
    return NextResponse.json(movies)
  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 })
  }
}
