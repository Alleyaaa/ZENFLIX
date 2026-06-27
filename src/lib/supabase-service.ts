import { createClient } from '@supabase/supabase-js'

const KEY = process.env.SUPABASE_SERVICE_KEY!
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabase = createClient(URL, KEY)

export const serviceClient = supabase

export interface SupabaseMovie {
  tmdb_id: number
  title: string
  year: number | null
  poster_url: string | null
  backdrop_url: string | null
  rating: number
  original_language: string | null
  media_type: string | null
  season_count: number | null
  episode_count: number | null
  embed_url: string | null
}

export const supabaseService = {
  async getMovies(category: string = 'popular', limit = 30): Promise<SupabaseMovie[]> {
    let query = supabase
      .from('movies')
      .select('*')
      .limit(limit)

    switch (category) {
      case 'now_playing':
        query = query
          .gte('year', 2024)
          .order('year', { ascending: false })
          .order('rating', { ascending: false })
        break
      case 'popular':
        query = query
          .order('rating', { ascending: false })
        break
      case 'top_rated':
        query = query
          .gte('rating', 7)
          .order('rating', { ascending: false })
        break
      case 'trending':
        query = query
          .order('rating', { ascending: false })
        break
      case 'anime':
        query = query
          .eq('original_language', 'ja')
          .order('rating', { ascending: false })
        break
      case 'film-indo':
        query = query
          .eq('original_language', 'id')
          .order('rating', { ascending: false })
        break
      case 'series':
        query = query
          .eq('media_type', 'tv')
          .order('rating', { ascending: false })
        break
      case 'movie':
        query = query
          .or('media_type.eq.movie,media_type.is.null')
          .order('rating', { ascending: false })
        break
      case 'latest':
        query = query
          .order('year', { ascending: false })
        break
      default:
        query = query.order('rating', { ascending: false })
    }

    const { data, error } = await query
    if (error) {
      console.error('Supabase query error:', error)
      return []
    }
    return (data || []) as SupabaseMovie[]
  },

  async getMovieByTmdbId(tmdbId: number): Promise<SupabaseMovie | null> {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single()
    return data as SupabaseMovie | null
  },

  async searchMovies(query: string): Promise<SupabaseMovie[]> {
    const { data } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(20)
    return (data || []) as SupabaseMovie[]
  }
}
