import { NextRequest, NextResponse } from 'next/server'

// Simpan laporan bug/kontak ke Supabase (tabel bug_reports)
// + kirim notifikasi ke webhook (Telegram/Discord) jika dikonfigurasi
const WEBHOOK_URL = process.env.BUG_REPORT_WEBHOOK_URL || process.env.ERROR_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, priority, steps, browser, device, user_id, anonymous } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Judul dan deskripsi wajib diisi' }, { status: 400 })
    }

    // Simpan ke Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_KEY

    let saved = false
    if (supabaseUrl && serviceKey) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/bug_reports`, {
          method: 'POST',
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            type: type || 'bug',
            title,
            description,
            priority: priority || 'medium',
            steps: steps || null,
            browser: browser || null,
            device: device || null,
            user_id: user_id || null,
            anonymous: anonymous || false,
            status: 'new',
          }),
        })
        saved = res.ok
      } catch {
        saved = false
      }
    }

    // Notifikasi ke webhook (jika ada)
    if (WEBHOOK_URL) {
      const text = `🐞 *Laporan Baru (${type})*\n*${title}*\nPrioritas: ${priority}\nDeskripsi: ${description?.slice(0, 300)}\n${steps ? `Langkah: ${steps?.slice(0, 200)}` : ''}\n${browser ? `Browser: ${browser?.slice(0, 100)}` : ''}${user_id ? `\nUser: ${user_id}` : ''}`
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch(() => {})
    }

    if (!saved) {
      // Simpan gagal tapi webhook mungkin jalan — treat as success anyway (best effort)
      return NextResponse.json({ ok: true, saved: false })
    }
    return NextResponse.json({ ok: true, saved: true })
  } catch {
    return NextResponse.json({ error: 'Gagal memproses laporan' }, { status: 500 })
  }
}