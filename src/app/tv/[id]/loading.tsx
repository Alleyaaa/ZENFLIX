export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 pt-12 space-y-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-16 rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-64 bg-[var(--bg-elevated)] rounded animate-pulse" />
          <div className="h-3 w-48 mt-2 bg-[var(--bg-elevated)] rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
        {[...Array(12)].map((_, i) => <div key={i} className="aspect-[2/3] rounded-xl bg-[var(--bg-elevated)] animate-pulse" />)}
      </div>
    </div>
  )
}