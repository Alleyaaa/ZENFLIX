import { NextRequest, NextResponse } from 'next/server'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!

export async function POST(request: NextRequest) {
  // ─── Auth guard (A01: Broken Access Control) ───
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  if (token) {
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${token}`,
      },
    })
    if (!userRes.ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { user_id, email, name, tier, amount } = body

  if (!tier || !amount) {
    return NextResponse.json({ error: 'Tier atau nominal tidak lengkap' }, { status: 400 })
  }

  if (!user_id || user_id === 'anon' || user_id === 'demo') {
    return NextResponse.json({ error: 'Harus login terlebih dahulu' }, { status: 401 })
  }

  // Order ID berisi tier biar webhook bisa update subscription sesuai paket
  const orderId = `ZENFLIX_${user_id}_${tier}_${Date.now()}`

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    item_details: [{ id: tier, price: amount, quantity: 1, name: `Zenflix ${tier.toUpperCase()} (bulanan)` }],
    customer_details: { email: email || 'guest@zenflix.id', first_name: name || 'Guest', last_name: '' },
    enabled_payments: ['credit_card', 'bank_transfer', 'qris', 'gopay', 'shopeepay'],
    credit_card: { secure: true },
    expiry: {
      start_time: new Date().toISOString().replace(/[TZ]/g, ' ').slice(0, 19) + ' +0700',
      unit: 'days',
      duration: 1,
    },
  }

  try {
    const res = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64'),
      },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok || data.status_code === '400') {
      return NextResponse.json({ error: data.status_message || 'Midtrans error' }, { status: res.status })
    }
    return NextResponse.json(data)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Gagal menghubungi Midtrans' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ tier: 'free' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  try {
    const token = authHeader.split(' ')[1]
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${token}` },
    })
    if (!userRes.ok) return NextResponse.json({ tier: 'free' })

    const user = await userRes.json()
    const subRes = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${user.id}&select=tier,active,expires_at&order=created_at.desc&limit=1`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    )
    if (!subRes.ok) return NextResponse.json({ tier: 'free' })

    const subs = await subRes.json()
    const sub = subs?.[0]
    if (!sub || !sub.active || (sub.expires_at && new Date(sub.expires_at) < new Date())) {
      return NextResponse.json({ tier: 'free' })
    }
    return NextResponse.json({ tier: sub.tier, expires_at: sub.expires_at })
  } catch {
    return NextResponse.json({ tier: 'free' })
  }
}
