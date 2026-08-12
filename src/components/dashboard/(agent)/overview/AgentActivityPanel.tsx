"use client";

import { PackageCheck, Truck, CheckCircle2, MapPin, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";

function ActivityRow({ Icon, title, sub, time, active }: {
  Icon: React.ElementType;
  title: string; sub: string; time: string; active: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
        active ? "bg-primary/10" : "bg-muted"
      }`} style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-card-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
        <span className="text-[11px] font-medium text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}

interface Props {
  availablePickups: number;
  activeDeliveries: number;
  completedToday:   number;
  assignedRoutes:   number;
  totalDeliveries:  number;
  completionPct:    number;
}

export function AgentActivityPanel({
  availablePickups, activeDeliveries, completedToday,
  assignedRoutes, totalDeliveries, completionPct,
}: Props) {
  return (
    <div className="lg:col-span-2 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Zap size={16} />
          </div>
          <div>
            <h2 className="text-sm font-black text-card-foreground">Today's Activity</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Live logistics summary</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full border"
          style={{
            color: "var(--success)",
            background: "color-mix(in srgb, var(--success) 10%, transparent)",
            borderColor: "color-mix(in srgb, var(--success) 30%, transparent)",
          }}>
          <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} /> LIVE
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        <ActivityRow
          Icon={PackageCheck}
          title="Available Pickups"
          sub={availablePickups > 0 ? `${availablePickups} order${availablePickups > 1 ? "s" : ""} waiting for collection` : "No pending pickups right now"}
          time="Now" active={availablePickups > 0}
        />
        <ActivityRow
          Icon={Truck}
          title="Active Deliveries"
          sub={activeDeliveries > 0 ? `${activeDeliveries} deliver${activeDeliveries > 1 ? "ies" : "y"} currently in progress` : "No active deliveries at the moment"}
          time="Live" active={activeDeliveries > 0}
        />
        <ActivityRow
          Icon={CheckCircle2}
          title="Completed Today"
          sub={completedToday > 0 ? `${completedToday} task${completedToday > 1 ? "s" : ""} successfully delivered` : "No completed deliveries yet today"}
          time="Today" active={completedToday > 0}
        />
        <ActivityRow
          Icon={MapPin}
          title="Route Coverage"
          sub={assignedRoutes > 0 ? `Covering ${assignedRoutes} zone${assignedRoutes > 1 ? "s" : ""} — Dhaka Metro` : "No zones assigned yet"}
          time="Today" active={assignedRoutes > 0}
        />
      </div>

      {/* Completion bar */}
      <div className="border-t border-border px-6 py-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-2 text-xs font-bold text-card-foreground">
            <Clock size={13} className="text-muted-foreground" /> Daily Completion Rate
          </span>
          <span className="text-xs font-black text-card-foreground">{completionPct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(completionPct, 100)}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            style={{
              background: completionPct >= 80 ? "var(--success)" : completionPct >= 50 ? "var(--primary)" : "var(--warning)",
            }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground font-medium">
          {completedToday} of {totalDeliveries || "—"} tasks completed today
        </p>
      </div>
    </div>
  );
}
