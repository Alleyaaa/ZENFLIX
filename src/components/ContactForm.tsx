'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, MessageCircle, AlertCircle, Loader2, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

interface BugReport {
  type: 'bug' | 'feature' | 'general'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  steps?: string
  browser?: string
  device?: string
}

export default function ContactForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('bug')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [steps, setSteps] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title.trim() || !description.trim()) {
      setError('Judul dan deskripsi wajib diisi')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // If not logged in, allow anonymous but warn
      // We'll still submit but mark as anonymous
    }

    const { data: { session } } = await supabase.auth.getSession()

    const payload = {
      type,
      title: title.trim(),
      description: description.trim(),
      priority,
      steps: steps?.trim(),
      browser: navigator.userAgent,
      device: `${window.innerWidth}x${window.innerHeight}`,
      user_id: user?.id || null,
      anonymous: !user,
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim laporan')
      setSuccess(true)
      setTitle('')
      setDescription('')
      setSteps('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 md:p-8 rounded-2xl" noValidate>
        <div className="flex flex-wrap gap-3 mb-6">
          {(['bug', 'feature', 'general'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border border-[var(--border)] hover:border-[var(--accent)]/50">
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="w-4 h-4 accent-[var(--accent)]"
              />
              <span className="capitalize text-sm font-medium text-[var(--text-main)]">{t}</span>
            </label>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[var(--text-main)] mb-1">Judul <span className="text-red-400">*</span></label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ringkas permasalahan / fitur..."
              maxLength={100}
              className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--text-main)] mb-1">Deskripsi Lengkap <span className="text-red-400">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan detail permasalahan, langkah reproduksi, screenshot (jika ada), dll."
              rows={5}
              className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
              required
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-[var(--text-main)] mb-1">Prioritas</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi (Crash / Keamanan)</option>
            </select>
          </div>

          <div>
            <label htmlFor="steps" className="block text-sm font-medium text-[var(--text-main)] mb-1">Langkah Reproduksi (Opsional)</label>
            <textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Buka halaman X\n2. Klik tombol Y\n3. Terjadi error Z..."
              rows={4}
              className="w-full p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="glass-btn px-6 py-2.5 rounded-xl text-sm font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-primary text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent-contrast)' }}
            >
              {loading ? (
                <>
                  <span className="animate-spin">
                    <svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  </span>
                  Memproses...
                </>
              ) : (
                <>
                  <span>Kirim Laporan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Success state */}
      {success && (
        <div className="flex flex-col items-center gap-4 text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold">Laporan Terkirim!</h3>
          <p className="text-[var(--text-muted)]">Terima kasih telah membantu memperbaiki Zenflix. Tim kami akan meninjau laporan Anda.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3"
          >
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      )}
    </section>
  )
}