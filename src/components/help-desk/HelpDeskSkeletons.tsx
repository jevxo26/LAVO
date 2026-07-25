function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

export function HelpDeskSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-12">
        {/* tickets skeleton */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Sk className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Sk className="h-4 w-36" />
              <Sk className="h-3 w-24" />
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-100 p-4 space-y-2.5">
              <div className="flex justify-between">
                <Sk className="h-4 w-44" />
                <Sk className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex gap-2">
                <Sk className="h-4 w-14 rounded-full" />
                <Sk className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* faq skeleton */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-100 bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Sk className="h-8 w-8 rounded-lg" />
            <div className="space-y-1.5">
              <Sk className="h-4 w-16" />
              <Sk className="h-3 w-28" />
            </div>
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-slate-100 pb-4 last:border-0 space-y-2">
              <Sk className="h-4 w-full" />
              <Sk className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
