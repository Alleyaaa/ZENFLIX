'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { MessageCircle, Send, Trash2, Loader2, AlertCircle } from 'lucide-react'

interface Comment {
  id: number
  user_id: string
  content: string
  created_at: string
  profiles?: { email?: string }
}

export default function CommentsSection({ mediaType, tmdbId }: { mediaType: 'movie' | 'tv'; tmdbId: number }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  const loadComments = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('media_type', mediaType)
        .eq('tmdb_id', tmdbId)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      // Fetch user emails for display (fallback: tampilkan "User" jika email tidak dibocorkan)
      setComments((data || []).map((c: Comment) => ({ ...c, profiles: { email: c.user_id.slice(0, 8) + '...' } })))
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [mediaType, tmdbId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handlePost = async () => {
    if (!user) return
    const trimmed = content.trim()
    if (!trimmed) return
    setPosting(true)
    setError('')
    try {
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        media_type: mediaType,
        tmdb_id: tmdbId,
        content: trimmed.slice(0, 500),
      })
      if (error) throw error
      setContent('')
      loadComments()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal mengirim komentar')
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!user) return
    const { error } = await supabase.from('comments').delete().eq('id', id).eq('user_id', user.id)
    if (!error) loadComments()
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={18} className="text-[var(--accent)]" />
        <h2 className="text-lg font-semibold">Komentar ({comments.length})</h2>
      </div>

      {/* Form komentar (login only) */}
      {user ? (
        <div className="space-y-3 mb-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0" style={{ color: 'var(--accent-contrast)' }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis komentar kamu tentang film ini..."
              rows={3}
              maxLength={500}
              className="flex-1 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
            />
          </div>
          <div className="flex items-center justify-between pl-12">
            <span className="text-[11px] text-[var(--text-tertiary)]">{content.length}/500</span>
            <button
              onClick={handlePost}
              disabled={posting || !content.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--accent-contrast)' }}
            >
              {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Kirim
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-xl pl-12">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl glass-card text-center">
          <p className="text-sm text-[var(--text-muted)] mb-2">Masuk untuk berkomentar</p>
          <Link href="/auth" className="btn-primary text-sm inline-block">Masuk / Daftar</Link>
        </div>
      )}

      {/* List komentar */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl glass-card animate-pulse">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[var(--bg-elevated)] rounded w-1/4" />
                <div className="h-3 bg-[var(--bg-elevated)] rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 glass-card rounded-xl">
          <p className="text-sm text-[var(--text-tertiary)]">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 rounded-xl glass-card">
              <div className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold text-[var(--text-muted)] shrink-0">
                {((c.profiles?.email || 'U')[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-main)]">
                      {c.profiles?.email?.split('@')[0] || 'Pengguna'}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">{formatDate(c.created_at)}</span>
                  </div>
                  {user?.id === c.user_id && (
                    <button onClick={() => handleDelete(c.id)} className="text-[var(--text-tertiary)] hover:text-red-400 transition-colors" aria-label="Hapus komentar">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1 break-words">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}