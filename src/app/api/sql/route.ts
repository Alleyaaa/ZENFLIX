import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ""
)

export async function POST(req: Request) {
  // ─── ADMIN_TOKEN guard (A01: Broken Access Control) ───
  // Fail-closed: tanpa ADMIN_TOKEN yang benar, endpoint TERTUTUP.
  const adminToken = process.env.ADMIN_TOKEN
  const provided = req.headers.get('x-admin-token')
  if (!adminToken || provided !== adminToken) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { query } = await req.json()
  if (!query) {
    return NextResponse.json({ error: 'No query provided' }, { status: 400 })
  }
  
  try {
    const { data, error } = await supabase.rpc('execute_sql', { query_string: query })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
