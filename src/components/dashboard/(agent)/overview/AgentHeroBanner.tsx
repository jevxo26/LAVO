"use client";

import Link from "next/link";
import { Sparkles, PackageCheck, Truck, Calendar, Radio, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const AVATAR_COLORS = [
  "from-blue-600 to-indigo-600", "from-cyan-500 to-blue-600",
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
    weekday: "long", month: "short", day: "numeric",
  });
}

const STATUS_META: Record<string, { dot: string; label: string; text: string; bg: string }> = {
  ACTIVE:      { dot: "bg-emerald-400 animate-pulse", label: "Duty Active",   text: "text-emerald-200", bg: "bg-emerald-500/20 border-emerald-400/30" },
  ON_DELIVERY: { dot: "bg-cyan-400 animate-pulse",    label: "On Route",      text: "text-cyan-200",    bg: "bg-cyan-500/20 border-cyan-400/30"    },
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
  const sm   = STATUS_META[status] ?? { dot: "bg-slate-400", label: status, text: "text-slate-200", bg: "bg-slate-500/20 border-slate-400/30" };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
      {/* Decorative ambient blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute -bottom-14 -left-14 h-60 w-60 rounded-full bg-cyan-500 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        {/* Left: avatar + greeting */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white text-xl font-black shadow-lg ring-4 ring-white/20`}>
              {initials(fullName)}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-slate-900">
              <span className={`h-2.5 w-2.5 rounded-full ${sm.dot}`} />
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-cyan-200 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30">
                <Sparkles size={12} className="text-cyan-300" /> Delivery Agent Workstation
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-extrabold border ${sm.bg} ${sm.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />{sm.label}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              {greeting()}, {fullName.split(" ")[0]}
            </h1>
            <p className="flex items-center gap-1.5 text-blue-200 text-xs font-medium">
              <Calendar size={13} /> {todayLabel()}
            </p>
          </div>
        </div>

        {/* Right: chips + action buttons */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Pickups", value: availablePickups, accent: "text-amber-300"   },
              { label: "Active",  value: activeDeliveries, accent: "text-cyan-300"     },
              { label: "Done",    value: completedToday,   accent: "text-emerald-300" },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-2.5 text-center min-w-[78px]">
                <p className={`text-[9px] font-black uppercase tracking-wider ${accent}`}>{label}</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Link href="/dashboard/pickups" className="flex-1">
              <Button className="w-full h-10 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-md gap-1.5">
                <PackageCheck size={14} /> Available Pickups
              </Button>
            </Link>
            <Link href="/dashboard/deliveries" className="flex-1">
              <Button variant="outline" className="w-full h-10 rounded-2xl border-white/25 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-1.5">
                <Truck size={14} /> Active Drop-Offs
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
