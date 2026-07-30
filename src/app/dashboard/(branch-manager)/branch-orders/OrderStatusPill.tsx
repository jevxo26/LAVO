const STATUS_META: Record<string, { cls: string; dot: string }> = {
  PENDING:            { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400"   },
  CONFIRMED:          { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500"    },
  PROCESSING:         { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500"  },
  WASHING:            { cls: "bg-cyan-50    text-cyan-700    border-cyan-200",    dot: "bg-cyan-500"    },
  IRONING:            { cls: "bg-violet-50  text-violet-700  border-violet-200",  dot: "bg-violet-500"  },
  READY_FOR_DELIVERY: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  COMPLETED:          { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:          { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400"    },
};

export function OrderStatusPill({ status }: { status: string }) {
  const s = STATUS_META[status?.toUpperCase()] ?? {
    cls: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}
