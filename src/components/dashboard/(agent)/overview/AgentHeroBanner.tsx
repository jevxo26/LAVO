"use client";

import Link from "next/link";
import { Sparkles, PackageCheck, Truck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-600", "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",  "from-amber-400 to-orange-500",
  "from-rose-500 to-pink-600",
];

function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "AG";
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

const STATUS_META: Record<string, { dot: string; label: string; text: string; bg: string }> = {
  ACTIVE:      { dot: "bg-emerald-400", label: "Active",      text: "text-emerald-100", bg: "bg-emerald-500/20" },
  ON_DELIVERY: { dot: "bg-blue-400",    label: "On Delivery", text: "text-blue-100",    bg: "bg-blue-500/20"    },
};

interface Props {
  fullName: string;
  status: string;
  availablePickups: number;
  activeDeliveries: number;
  completedToday: number;
}

export function AgentHeroBanner({
  fullName, status, availablePickups, activeDeliveries, completedToday,
}: Props) {
  const grad = avatarGradient(fullName);
  const sm   = STATUS_META[status] ?? { dot: "bg-slate-400", label: status, text: "text-slate-100", bg: "bg-slate-500/20" };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-7 py-9">
      {/* Decorative blobs + dot grid */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/[0.07] blur-2xl" />
        <div className="absolute -bottom-14 -left-14 h-60 w-60 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        {/* Left: avatar + greeting */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white text-xl font-extrabold shadow-lg ring-4 ring-white/20`}>
              {initials(fullName)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-700 ring-2 ring-indigo-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={11} className="text-indigo-300" /> Delivery Agent Portal
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border border-white/20 ${sm.bg} ${sm.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />{sm.label}
              </span>
            </div>
            <h1 className="text-2xl md:text-[1.7rem] font-extrabold tracking-tight text-white leading-tight">
              {greeting()}, {fullName.split(" ")[0]}
            </h1>
            <p className="flex items-center gap-1.5 text-indigo-300 text-[12px] font-medium">
              <Calendar size={12} />{todayLabel()}
            </p>
          </div>
        </div>

        {/* Right: chips + buttons */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Pickups", value: availablePickups, accent: "text-amber-300"   },
              { label: "Active",  value: activeDeliveries, accent: "text-sky-300"     },
              { label: "Done",    value: completedToday,   accent: "text-emerald-300" },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm px-4 py-2.5 text-center min-w-[72px]">
                <p className={`text-[9px] font-bold uppercase tracking-wider ${accent}`}>{label}</p>
                <p className="text-white font-extrabold text-xl leading-tight mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/pickups">
              <Button className="h-9 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 gap-1.5 shadow-sm">
                <PackageCheck size={13} /> Pickups
              </Button>
            </Link>
            <Link href="/dashboard/deliveries">
              <Button variant="outline" className="h-9 rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 font-medium text-xs px-4 gap-1.5">
                <Truck size={13} /> Deliveries
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
