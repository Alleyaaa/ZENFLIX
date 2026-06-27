import { NextRequest, NextResponse } from 'next/server'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { user_id, email, name, tier, amount } = body

  if (!tier || !amount) {
    return NextResponse.json({ error: 'Missing tier or amount' }, { status: 400 })
  }

  const orderId = `ZENFLIX_${user_id || 'anon'}_${Date.now()}`

  const payload = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    item_details: [{ id: tier, price: amount, quantity: 1, name: `ZENFLIX ${tier.toUpperCase()} Subscription` }],
    customer_details: { email: email || 'guest@zenflix.id', first_name: name || 'Guest', last_name: '', phone: '+628****7890' },
    enabled_payments: ['credit_card', 'bank_transfer', 'qris', 'gopay', 'shopeepay'],
    credit_card: { secure: true }
  }

  try {
    const res = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64') },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.status_message || 'Midtrans error' }, { status: res.status })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ tier: 'free' })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!
  try {
    const token = authHeader.split(' ')[1]
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` } })
    if (!userRes.ok) return NextResponse.json({ tier: 'free' })
    const user = await userRes.json()
    const subRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${user.id}&select=tier,active,expires_at`, { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` } })
    if (!subRes.ok) return NextResponse.json({ tier: 'free' })
    const subs = await subRes.json()
    const sub = subs?.[0]
    if (!sub || !sub.active || (sub.expires_at && new Date(sub.expires_at) < new Date())) return NextResponse.json({ tier: 'free' })
    return NextResponse.json({ tier: sub.tier, expires_at: sub.expires_at })
  } catch {
    return NextResponse.json({ tier: 'free' })
  }
}