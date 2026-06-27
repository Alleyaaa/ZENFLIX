import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = "eyJhbG...Y860"

export async function GET() {
  const queries = [
    `SELECT COUNT(*) as total FROM movies`,
    `SELECT COUNT(*) as movies_count FROM movies WHERE media_type='movie' OR media_type IS NULL`,
    `SELECT COUNT(*) as series_count FROM movies WHERE media_type='tv'`,
    `SELECT COUNT(*) as anime_count FROM movies WHERE original_language='ja'`,
    `SELECT COUNT(*) as indo_count FROM movies WHERE original_language='id'`,
    `SELECT ROUND(AVG(rating),1) as avg_rating FROM movies WHERE rating > 0`,
  ]

  const counts: Record<string, number> = {}
  for (const q of queries) {
    const alias = q.match(/as (\w+)/)?.[1] || 'val'
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ query: q }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.[0]) counts[alias] = Number(data[0][alias]) || 0
      }
    } catch {}
  }

  return NextResponse.json(counts)
}
