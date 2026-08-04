import { cn } from "@/lib/utils";

// dot color + text color + bg + border
const STATUS_META: Record<string, { cls: string; dot: string }> = {
  // positive
  active:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  approved:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  published:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  resolved:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  paid:       { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  completed:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  verified:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  // warning
  pending:    { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"  },
  processing: { cls: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-500"   },
  open:       { cls: "bg-blue-50   text-blue-700   border-blue-200",     dot: "bg-blue-500"   },
  in_progress:{ cls: "bg-indigo-50 text-indigo-700 border-indigo-200",   dot: "bg-indigo-500" },
  // negative
  inactive:   { cls: "bg-slate-50  text-slate-600  border-slate-200",    dot: "bg-slate-400"  },
  hidden:     { cls: "bg-slate-50  text-slate-600  border-slate-200",    dot: "bg-slate-400"  },
  rejected:   { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"   },
  suspended:  { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"   },
  blocked:    { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"   },
  cancelled:  { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"   },
  low_stock:  { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"  },
  out_of_stock:{ cls: "bg-rose-50  text-rose-700   border-rose-200",     dot: "bg-rose-400"   },
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const s   = STATUS_META[key] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
      s.cls
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {status}
    </span>
  );
}
