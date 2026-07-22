export function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toUpperCase();
  const map: Record<string, { cls: string; dot: string; label: string }> = {
    PUBLISHED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Published" },
    PENDING:   { cls: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   label: "Pending"   },
    HIDDEN:    { cls: "bg-slate-100 text-slate-500 border-slate-200",       dot: "bg-slate-400",   label: "Hidden"    },
  };
  const { cls, dot, label } = map[s] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function TypeBadge({ type }: { type: "Express" | "Standard" }) {
  return type === "Express"
    ? <span className="rounded-md bg-violet-100 text-violet-700 px-2 py-0.5 text-[11px] font-bold">Express</span>
    : <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-bold">Standard</span>;
}
