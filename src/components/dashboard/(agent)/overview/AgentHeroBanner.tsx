"use client";

import Link from "next/link";
import { Sparkles, PackageCheck, Truck, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-500 to-pink-600",
];

function avatarGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
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

// status meta — uses only success/secondary tokens, no hardcoded colors
const STATUS_META: Record<string, { dotCls: string; label: string }> = {
  ACTIVE:      { dotCls: "animate-pulse", label: "Duty Active" },
  ON_DELIVERY: { dotCls: "animate-pulse", label: "On Route"    },
};

interface Props {
  fullName:         string;
  status:           string;
  availablePickups: number;
  activeDeliveries: number;
  completedToday:   number;
}

export function AgentHeroBanner({
  fullName, status, availablePickups, activeDeliveries, completedToday,
}: Props) {
  const grad = avatarGradient(fullName);
  const sm   = STATUS_META[status] ?? { dotCls: "", label: status };
  const isOnDelivery = status === "ON_DELIVERY";

  return (
    <div className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white shadow-2xl"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 35%, var(--foreground) 65%) 0%, color-mix(in srgb, var(--primary) 75%, var(--foreground) 25%) 55%, color-mix(in srgb, var(--secondary) 55%, var(--foreground) 45%) 100%)",
        border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-[0.35] blur-3xl"
          style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-14 -left-14 h-60 w-60 rounded-full opacity-[0.28] blur-3xl"
          style={{ background: "var(--secondary)" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        {/* Left: avatar + greeting */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white text-xl font-black shadow-lg`}
              style={{ boxShadow: "0 0 0 4px color-mix(in srgb, var(--primary-foreground) 18%, transparent)" }}>
              {initials(fullName)}
            </div>
            {/* Status dot */}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ background: "var(--foreground)", boxShadow: "0 0 0 2px var(--foreground)" }}>
              <span className={`h-2.5 w-2.5 rounded-full ${sm.dotCls}`}
                style={{ background: isOnDelivery ? "var(--secondary)" : "var(--success)" }} />
            </span>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Role badge */}
              <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md px-3 py-0.5 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                  color: "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
                }}>
                <Sparkles size={12} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
                Delivery Agent Workstation
              </span>
              {/* Status badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-extrabold backdrop-blur-md"
                style={{
                  background: isOnDelivery
                    ? "color-mix(in srgb, var(--secondary) 22%, transparent)"
                    : "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: isOnDelivery
                    ? "1px solid color-mix(in srgb, var(--secondary) 40%, transparent)"
                    : "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color: isOnDelivery
                    ? "color-mix(in srgb, var(--secondary-foreground) 80%, var(--secondary) 20%)"
                    : "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}>
                <span className={`h-1.5 w-1.5 rounded-full ${sm.dotCls}`}
                  style={{ background: isOnDelivery ? "var(--secondary)" : "var(--success)" }} />
                {sm.label}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              {greeting()}, {fullName.split(" ")[0]}
            </h1>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <Calendar size={13} /> {todayLabel()}
            </p>
          </div>
        </div>

        {/* Right: chips + buttons */}
        <div className="flex flex-col gap-3 shrink-0">
          {/* Telemetry chips */}
          <div className="flex flex-wrap gap-2.5">
            {[
              { label: "Pickups", value: availablePickups, token: "var(--warning)"   },
              { label: "Active",  value: activeDeliveries, token: "var(--secondary)" },
              { label: "Done",    value: completedToday,   token: "var(--success)"   },
            ].map(({ label, value, token }) => (
              <div key={label}
                className="rounded-2xl px-4 py-2.5 text-center min-w-[78px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                }}>
                <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: token }}>{label}</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5 tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link href="/dashboard/pickups" className="flex-1">
              <Button className="w-full h-10 rounded-2xl font-extrabold text-xs gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                  color: "var(--primary)",
                  boxShadow: "0 2px 12px color-mix(in srgb, var(--primary) 20%, transparent)",
                }}>
                <PackageCheck size={14} /> Available Pickups
              </Button>
            </Link>
            <Link href="/dashboard/deliveries" className="flex-1">
              <Button variant="outline"
                className="w-full h-10 rounded-2xl border-white/25 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-1.5">
                <Truck size={14} /> Active Drop-Offs
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
