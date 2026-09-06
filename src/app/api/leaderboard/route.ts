import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

// Leaderboard: aggregate watch history per user
// Period: daily | weekly | monthly | all_time
// Metric: watch_time | films_watched | series_watched
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'weekly'
  const metric = searchParams.get('metric') || 'watch_time'
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    // Hitung window waktu
    const now = new Date()
    let startDate: Date
    switch (period) {
      case 'daily':
        startDate = new Date(now); startDate.setHours(0, 0, 0, 0)
        break
      case 'weekly':
        startDate = new Date(now); startDate.setDate(startDate.getDate() - 7)
        break
      case 'monthly':
        startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 1)
        break
      default:
        startDate = new Date(0)
    }

    // Aggregate watch_history + profiles
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/watch_history?select=user_id,duration_watched,completed,media_type&watched_at=gte.${startDate.toISOString()}&order=watched_at.desc&limit=1000`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    )
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    const history = await res.json()

    // Aggregate manual
    const userStats: Record<string, { watch_time: number; films: number; series: number; completed: number }> = {}
    for (const h of history || []) {
      const uid = h.user_id
      if (!userStats[uid]) userStats[uid] = { watch_time: 0, films: 0, series: 0, completed: 0 }
      userStats[uid].watch_time += h.duration_watched || 0
      if (h.completed) {
        userStats[uid].completed++
        if (h.media_type === 'tv') userStats[uid].series++
        else userStats[uid].films++
      }
    }

    const ranking = Object.entries(userStats)
          .map(([user_id, s]) => ({
            user_id,
            watch_time: s.watch_time,
            films_watched: s.films + s.completed,
            series_watched: s.series,
            score: metric === 'films_watched' ? s.films + s.completed : metric === 'series_watched' ? s.series : s.watch_time,
            username: '',
            avatar_url: null as string | null,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((entry, i) => ({ ...entry, rank: i + 1 }))

    // Ambil profile info (username) untuk tiap user
    if (ranking.length > 0) {
      const ids = ranking.map(r => r.user_id).join(',')
      const profRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,username,full_name,avatar_url&id=in.(${ids})`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      )
      if (profRes.ok) {
        const profiles = await profRes.json()
        const profMap: Record<string, any> = {}
        for (const p of profiles || []) profMap[p.id] = p
        for (const r of ranking) {
          r.username = profMap[r.user_id]?.username || profMap[r.user_id]?.full_name || `User ${r.user_id.slice(0, 6)}`
          r.avatar_url = profMap[r.user_id]?.avatar_url || null
        }
      }
    }

    return NextResponse.json({
      period,
      metric,
      generatedAt: now.toISOString(),
      results: ranking,
    })
  } catch (err) {
    console.error('Leaderboard error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}