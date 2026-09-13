'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import MovieCard from '@/components/MovieCard'
import { useAuth } from '@/components/AuthProvider'
import { Heart, ArrowLeft } from 'lucide-react'

interface FavItem { id: string|number; tmdb_id?: number; title?: string; poster_path?: string|null; release_date?: string; vote_average?: number; media_type?: string }

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<FavItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zenflix-favorites')
      setItems(raw ? JSON.parse(raw) : [])
    } catch {}
    setReady(true)
  }, [user])

  if (loading) return <div className="min-h-screen"><Header/><main className="max-w-[1200px] mx-auto px-4 py-24 flex justify-center"><div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/></main></div>

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 pt-24 pb-16">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] mb-4 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Profil
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[var(--accent)] bg-opacity-15 flex items-center justify-center">
            <Heart size={22} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Favorit</h1>
            <p className="text-sm text-[var(--text-muted)]">Film & serial yang kamu tandai sebagai favorit</p>
          </div>
        </div>

        {!ready ? null : items.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <Heart size={40} className="mx-auto text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-muted)] mb-1">Belum ada film favorit.</p>
            <p className="text-sm text-[var(--text-tertiary)] mb-6">Ketuk ikon hati di detail film untuk menyimpannya di sini.</p>
            <Link href="/" className="btn-primary inline-block">Jelajahi Film</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((m) => <MovieCard key={m.id} movie={m as any} />)}
          </div>
        )}
      </main>
    </div>
  )
}
