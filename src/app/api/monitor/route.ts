import { NextResponse } from 'next/server'

// Lightweight client error monitor endpoint.
// Plug Sentry/webhook here later; for now logs + optional Discord/Telegram webhook.
const WEBHOOK_URL = process.env.ERROR_WEBHOOK_URL

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { message, digest, stack, url, userAgent } = body

    const entry = {
      time: new Date().toISOString(),
      message: message || 'Unknown error',
      digest: digest || null,
      url: url || null,
      userAgent: userAgent || null,
      stack: stack ? String(stack).split('\n').slice(0, 5).join('\n') : null,
    }

    // Log locally
    console.error('[ClientError]', entry)

    // Forward to webhook if configured
    if (WEBHOOK_URL) {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `\`\`\`json\n${JSON.stringify(entry, null, 2)}\n\`\`\`` }),
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}