import { Package, Clock, Shirt, CheckCircle2 } from "lucide-react";

interface Props {
  total: number;
  pending: number;
  processing: number;
  ready: number;
}

export function OrderStatCards({ total, pending, processing, ready }: Props) {
  const cards = [
    { label: "Total Orders",   sub: "All active",            value: total,      Icon: Package,      iconBg: "bg-blue-50 dark:bg-blue-950/50",    iconColor: "text-blue-600 dark:text-blue-400",    ringColor: "ring-blue-100 dark:ring-blue-900/40"  },
    { label: "Pending",        sub: "Awaiting processing",   value: pending,    Icon: Clock,        iconBg: "bg-amber-50 dark:bg-amber-950/50",   iconColor: "text-amber-600 dark:text-amber-400",   ringColor: "ring-amber-100 dark:ring-amber-900/40"   },
    { label: "In Processing",  sub: "Being washed / ironed", value: processing, Icon: Shirt,        iconBg: "bg-cyan-50 dark:bg-cyan-950/50",    iconColor: "text-cyan-600 dark:text-cyan-400",    ringColor: "ring-cyan-100 dark:ring-cyan-900/40"    },
    { label: "Ready",          sub: "Ready for delivery",    value: ready,      Icon: CheckCircle2, iconBg: "bg-emerald-50 dark:bg-emerald-950/50", iconColor: "text-emerald-600 dark:text-emerald-400", ringColor: "ring-emerald-100 dark:ring-emerald-900/40" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
        <div key={label}
          className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 dark:bg-slate-900 dark:border-slate-800">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
            <p className="mt-0.5 text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">{label}</p>
            <p className="text-[11px] font-medium text-slate-400 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
