import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('watchlist')
    .select('*, movies(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { user_id, movie_id, title, poster_url, rating } = body

  if (!user_id || !movie_id) {
    return NextResponse.json({ error: 'user_id & movie_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('watchlist')
    .upsert({ user_id, movie_id, title, poster_url, rating })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data?.[0] || { success: true })
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('user_id')
  const movieId = searchParams.get('movie_id')

  if (!userId || !movieId) {
    return NextResponse.json({ error: 'user_id & movie_id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('movie_id', movieId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}