import SkeletonCard from './SkeletonCard'

export default function DbMovieRowSkeleton() {
  return (
    <div className="mb-8">
      <div className="h-6 w-48 rounded bg-[var(--bg-elevated)] mb-4 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
