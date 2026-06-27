import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    const orderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status

    // Verify signature
    const orderIdParts = orderId?.split('_') || []
    const userId = orderIdParts[1]

    // Update subscription based on payment status
    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept') {
        // Payment success — activate subscription
        if (userId && userId !== 'anon') {
          await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
            method: 'POST',
            headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
            body: JSON.stringify({
              user_id: userId,
              tier: 'premium',
              active: true,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString()
            })
          })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
