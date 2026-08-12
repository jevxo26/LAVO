function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

export function OrderCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2"><Sk className="h-4 w-24" /><Sk className="h-4 w-16" /></div>
          <Sk className="h-3 w-40" />
        </div>
        <div className="text-right space-y-1"><Sk className="h-3 w-16" /><Sk className="h-4 w-10" /></div>
      </div>
      <Sk className="h-1.5 w-full" />
      <div className="flex gap-4"><Sk className="h-3 w-20" /><Sk className="h-3 w-16" /></div>
    </div>
  );
}

export function GarmentPanelSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><Sk className="h-4 w-28" /><Sk className="h-4 w-16" /></div>
          <Sk className="h-3 w-40" />
        </div>
        <div className="flex gap-2"><Sk className="h-8 w-24 rounded-xl" /><Sk className="h-8 w-20 rounded-xl" /></div>
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <Sk className="h-9 w-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5"><Sk className="h-3.5 w-32" /><Sk className="h-2.5 w-20" /></div>
            <Sk className="h-7 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GarmentRowSkeleton() {
  return (
    <div className="divide-y divide-border">
      {[0,1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3.5">
          <Sk className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5"><Sk className="h-3.5 w-32" /><Sk className="h-2.5 w-20" /></div>
          <Sk className="h-7 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}
