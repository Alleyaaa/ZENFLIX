'use client'
import SkeletonCard from '@/components/SkeletonCard'
import DbMovieRowSkeleton from '@/components/DbMovieRowSkeleton'

export function PageSkeleton() {
  return (
    <div className="space-y-8 pt-24">
      <div className="max-w-[1400px] mx-auto px-4 space-y-8">
        <div>
          <div className="h-8 w-64 bg-[var(--bg-elevated)] rounded-lg animate-pulse" />
          <div className="h-4 w-96 mt-2 bg-[var(--bg-elevated)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[...Array(18)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  )
}

export function RowSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-24 space-y-10">
      <DbMovieRowSkeleton />
      <DbMovieRowSkeleton />
      <DbMovieRowSkeleton />
      <DbMovieRowSkeleton />
    </div>
  )
}

/* Usage:
import { PageSkeleton } from '@/components/Skeletons'
if (loading) return <PageSkeleton />
*/