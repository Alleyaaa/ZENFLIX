import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    const orderId = notification.order_id as string
    const transactionStatus = notification.transaction_status as string
    const fraudStatus = notification.fraud_status as string
    const statusCode = notification.status_code as string
    const grossAmount = notification.gross_amount as string
    const signatureKey = notification.signature_key as string

    // ─── Verifikasi signature Midtrans (keamanan wajib) ───
    if (MIDTRANS_SERVER_KEY) {
      const expected = crypto
        .createHash('sha512')
        .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
        .digest('hex')
      if (signatureKey && !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureKey || ''))) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
      }
    }

    // ─── Parse order_id: ZENFLIX_{userId}_{tier}_{timestamp} ───
    const parts = orderId?.split('_') || []
    const userId = parts[1]
    const tier = parts[2] || 'premium'
    const expiresDays = tier === 'ultimate' ? 30 : tier === 'premium' ? 30 : 30

    const isSuccess =
      (transactionStatus === 'capture' && fraudStatus === 'accept') ||
      (transactionStatus === 'settlement')

    if (isSuccess && userId && userId !== 'anon' && supabaseUrl && serviceKey) {
      const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()

      await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          tier,
          active: true,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Payment webhook error:', err)
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 })
  }
}