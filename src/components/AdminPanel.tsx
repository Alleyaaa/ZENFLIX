'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { Shield, Bug, MessageSquare, Users, Loader2, AlertCircle, Trash2, CheckCircle, XCircle, TrendingUp, Film, Tv, Star } from 'lucide-react'

interface BugReport {
  id: number
  type: string
  title: string
  description: string
  priority: string
  status: string
  created_at: string
  user_id: string | null
}

interface AdminStats {
  users: number
  reports: number
  comments: number
}

export default function AdminPanel() {
  const { user } = useAuth()
  const [reports, setReports] = useState<BugReport[]>([])
  const [stats, setStats] = useState<AdminStats>({ users: 0, reports: 0, comments: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  // ─── Cek admin: hanya user dengan email tertentu yang bisa akses ───
  const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(false)
        setCheckingAdmin(false)
        return
      }
      const email = user.email?.toLowerCase() || ''
      // Fallback: kalau env kosong, izinkan sementara (dev) — TAPI ditandai
      if (ADMIN_EMAILS.length === 0) {
        setIsAdmin(true) // dev mode: semua logged-in bisa (ganti di produksi!)
        console.warn('[Admin] Admin emails belum dikonfigurasi. Mode dev: semua user bisa akses.')
      } else {
        setIsAdmin(ADMIN_EMAILS.includes(email))
      }
      setCheckingAdmin(false)
    }
    check()
  }, [user])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // Reports
      const { data: reportsData, error: reportsErr } = await supabase
        .from('bug_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (!reportsErr) setReports(reportsData || [])

      // Stats
      let userCount: number | null = null
      let reportCount: number | null = null
      let commentCount: number | null = null
      try {
        const { count: c } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        userCount = c
      } catch { /* table may not exist */ }
      try {
        const { count: c } = await supabase.from('bug_reports').select('*', { count: 'exact', head: true })
        reportCount = c
      } catch { /* table may not exist */ }
      try {
        const { count: c } = await supabase.from('comments').select('*', { count: 'exact', head: true })
        commentCount = c
      } catch { /* table may not exist */ }

      setStats({
        users: userCount || 0,
        reports: reportCount || 0,
        comments: commentCount || 0,
      })
    } catch {
      setError('Gagal memuat data admin. Pastikan tabel sudah dibuat di Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadData()
  }, [isAdmin, loadData])

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('bug_reports').update({ status }).eq('id', id)
    if (!error) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    }
  }

  const deleteReport = async (id: number) => {
    const { error } = await supabase.from('bug_reports').delete().eq('id', id)
    if (!error) {
      setReports(prev => prev.filter(r => r.id !== id))
    }
  }

  if (checkingAdmin) {
    return <div className="text-center py-20 text-[var(--text-muted)]">Memeriksa akses...</div>
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 glass-card rounded-2xl p-8">
        <Shield size={48} className="text-[var(--accent)] mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-3">Akses Ditolak</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Halaman ini khusus admin. Login dengan akun yang terdaftar sebagai admin.
        </p>
        {!user && (
          <a href="/auth" className="btn-primary inline-block px-6 py-3">Login Admin</a>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Users size={22} className="text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.users}</p>
            <p className="text-xs text-[var(--text-muted)]">Pengguna</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
            <Bug size={22} className="text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.reports}</p>
            <p className="text-xs text-[var(--text-muted)]">Laporan Bug</p>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center">
            <MessageSquare size={22} className="text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.comments}</p>
            <p className="text-xs text-[var(--text-muted)]">Komentar</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Bug reports table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Bug size={18} className="text-[var(--accent)]" />
            Laporan Bug / Fitur
          </h3>
          <span className="text-xs text-[var(--text-tertiary)]">{reports.length} laporan</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-[var(--text-muted)]">
            <Loader2 size={24} className="animate-spin mx-auto mb-3" />
            Memuat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-[var(--text-tertiary)]">Belum ada laporan.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {reports.map((r) => (
              <div key={r.id} className="p-4 hover:bg-[var(--bg-elevated)]/50 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.priority === 'high' ? 'bg-red-500/15 text-red-400' :
                        r.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-blue-500/15 text-blue-400'
                      }`}>
                        {r.priority}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                        {r.type}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.status === 'done' ? 'bg-green-500/15 text-green-400' :
                        r.status === 'in_progress' ? 'bg-yellow-500/15 text-yellow-400' :
                        'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                      }`}>
                        {r.status}
                      </span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-semibold text-sm mt-2">{r.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{r.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status !== 'done' && (
                      <button onClick={() => updateStatus(r.id, 'done')} className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 flex items-center justify-center transition-all" aria-label="Tandai selesai">
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {r.status === 'done' && (
                      <button onClick={() => updateStatus(r.id, 'new')} className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center justify-center transition-all" aria-label="Buka kembali">
                        <XCircle size={15} />
                      </button>
                    )}
                    <button onClick={() => deleteReport(r.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all" aria-label="Hapus laporan">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note: tampilkan instruksi setup SQL */}
      <div className="glass-card rounded-2xl p-5 border border-dashed border-[var(--accent)]/30">
        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-[var(--accent)]" />
          Setup SQL (jalankan di Supabase SQL Editor)
        </h4>
        <pre className="text-[11px] text-[var(--text-muted)] overflow-x-auto bg-[var(--bg-elevated)] p-4 rounded-xl">{`CREATE TABLE IF NOT EXISTS public.bug_reports (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type text DEFAULT 'bug',
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium',
  status text DEFAULT 'new',
  steps text,
  browser text,
  device text,
  user_id uuid,
  anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_admin_all" ON public.bug_reports FOR ALL USING (true);`}</pre>
      </div>
    </div>
  )
}