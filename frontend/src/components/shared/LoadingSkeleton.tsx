export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-slate-50">
      {/* Header row */}
      <div className="flex items-center gap-4 bg-muted/40 px-4 py-3">
        {[40, 25, 20, 15].map((w, i) => (
          <div key={i} className={`h-3 animate-pulse rounded bg-slate-200`}
            style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-3 w-[40%] animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-[25%] animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-[20%] animate-pulse rounded bg-slate-100" />
          <div className="h-5 w-[12%] animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
