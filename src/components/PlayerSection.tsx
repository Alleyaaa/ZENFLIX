'use client'
import { useAuth } from './AuthProvider'
import Player from './Player'
import Link from 'next/link'

export default function PlayerSection({ tmdbId }: { tmdbId: number }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="rounded-2xl overflow-hidden mb-8 bg-black/30 h-[350px] animate-pulse" />

  if (!user) {
    return (
      <div className="rounded-2xl overflow-hidden mb-8 relative bg-black/40 border border-white/[0.06]">
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center space-y-4 px-6">
            <p className="text-lg font-semibold gradient-text">Sign in to Watch</p>
            <p className="text-sm text-white/50 max-w-xs mx-auto">
              Login to start streaming movies in HD.
            </p>
            <Link href="/auth" className="inline-block px-6 py-2.5 gradient-btn rounded-xl text-sm font-semibold shadow-lg">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-8">
      <Player tmdbId={tmdbId} />
    </div>
  )
}
