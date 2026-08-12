const STATUS_META: Record<string, { cls: string; dot: string }> = {
  PICKUP:     { cls: "bg-primary/10 text-primary border-primary/25",       dot: "bg-primary animate-pulse" },
  CONFIRMED:  { cls: "bg-primary/10 text-primary border-primary/25",       dot: "bg-primary"               },
  PROCESSING: { cls: "bg-warning/10 text-warning border-warning/25",       dot: "bg-warning animate-pulse" },
  WASHING:    { cls: "bg-primary/10 text-primary border-primary/25",       dot: "bg-primary animate-pulse" },
  DRYING:     { cls: "bg-warning/10 text-warning border-warning/25",       dot: "bg-warning"               },
  IRONING:    { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary"             },
  FOLDING:    { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary"             },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS_META[status?.toUpperCase()] ?? {
    cls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}
