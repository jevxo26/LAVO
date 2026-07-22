function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

export function SummarySkeletons() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4">
          <Sk className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Sk className="h-6 w-10" />
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeletons() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden flex h-48">
          <Sk className="w-[148px] shrink-0 rounded-none" />
          <div className="flex-1 p-5 space-y-3">
            <div className="flex gap-3">
              <Sk className="h-4 w-36" />
              <Sk className="h-5 w-16 rounded-full" />
            </div>
            <Sk className="h-5 w-48" />
            <div className="flex gap-6">
              <Sk className="h-3 w-20" />
              <Sk className="h-3 w-20" />
              <Sk className="h-3 w-16" />
            </div>
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  );
}
