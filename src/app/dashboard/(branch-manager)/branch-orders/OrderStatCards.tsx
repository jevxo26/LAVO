import { Package, Clock, Shirt, CheckCircle2 } from "lucide-react";

interface Props {
  total: number;
  pending: number;
  processing: number;
  ready: number;
}

export function OrderStatCards({ total, pending, processing, ready }: Props) {
  const cards = [
    { label: "Total Orders",   sub: "All active",            value: total,      Icon: Package,      iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
    { label: "Pending",        sub: "Awaiting processing",   value: pending,    Icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
    { label: "In Processing",  sub: "Being washed / ironed", value: processing, Icon: Shirt,        iconBg: "bg-blue-50",    iconColor: "text-blue-600",    ringColor: "ring-blue-100"    },
    { label: "Ready",          sub: "Ready for delivery",    value: ready,      Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
        <div key={label}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
            <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
