function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

export function OrderSummarySkeletons() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4 shadow-sm">
          <Sk className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Sk className="h-6 w-12" />
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderCardSkeletons() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
          {/* header */}
          <div className="flex items-center justify-between p-5 gap-4">
            <div className="flex items-center gap-4">
              <Sk className="h-12 w-12 rounded-xl shrink-0" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sk className="h-4 w-28" />
                  <Sk className="h-5 w-16 rounded-full" />
                  <Sk className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-16" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="space-y-1 text-right">
                <Sk className="h-3 w-16 ml-auto" />
                <Sk className="h-5 w-20 ml-auto" />
              </div>
              <Sk className="h-8 w-20 rounded-xl" />
              <Sk className="h-5 w-5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
