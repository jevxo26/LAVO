export function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-md bg-slate-100"
        />
      ))}
    </div>
  )
}
