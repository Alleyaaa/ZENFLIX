export default function SkeletonCard() {
  return (
    <div className="group block">
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-elevated)] animate-pulse" />
      <div className="mt-2 h-4 w-3/4 rounded bg-[var(--bg-elevated)] animate-pulse" />
      <div className="mt-1 h-3 w-1/4 rounded bg-[var(--bg-elevated)] animate-pulse" />
    </div>
  )
}
