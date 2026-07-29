"use client";

import { PackageCheck, Truck, CheckCircle2, MapPin, Clock, Zap } from "lucide-react";

function ActivityRow({ Icon, iconBg, iconColor, title, sub, time, dotColor }: {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; sub: string; time: string; dotColor: string;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor} mt-0.5`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="text-[11px] font-medium text-slate-400">{time}</span>
      </div>
    </div>
  );
}

interface Props {
  availablePickups: number;
  activeDeliveries: number;
  completedToday: number;
  assignedRoutes: number;
  totalDeliveries: number;
  completionPct: number;
}

export function AgentActivityPanel({
  availablePickups, activeDeliveries, completedToday,
  assignedRoutes, totalDeliveries, completionPct,
}: Props) {
  return (
    <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Zap size={14} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Today's Activity</h2>
            <p className="text-[11px] text-slate-400">Live logistics summary</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-50">
        <ActivityRow
          Icon={PackageCheck} iconBg="bg-amber-50" iconColor="text-amber-600"
          title="Available Pickups"
          sub={availablePickups > 0 ? `${availablePickups} order${availablePickups > 1 ? "s" : ""} waiting for collection` : "No pending pickups right now"}
          time="Now" dotColor={availablePickups > 0 ? "bg-amber-400" : "bg-slate-300"}
        />
        <ActivityRow
          Icon={Truck} iconBg="bg-indigo-50" iconColor="text-indigo-600"
          title="Active Deliveries"
          sub={activeDeliveries > 0 ? `${activeDeliveries} delivery${activeDeliveries > 1 ? "ies" : ""} currently in progress` : "No active deliveries at the moment"}
          time="Live" dotColor={activeDeliveries > 0 ? "bg-indigo-500" : "bg-slate-300"}
        />
        <ActivityRow
          Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          title="Completed Today"
          sub={completedToday > 0 ? `${completedToday} task${completedToday > 1 ? "s" : ""} successfully delivered` : "No completed deliveries yet today"}
          time="Today" dotColor={completedToday > 0 ? "bg-emerald-500" : "bg-slate-300"}
        />
        <ActivityRow
          Icon={MapPin} iconBg="bg-sky-50" iconColor="text-sky-600"
          title="Route Coverage"
          sub={assignedRoutes > 0 ? `Covering ${assignedRoutes} zone${assignedRoutes > 1 ? "s" : ""} — Dhaka Metro` : "No zones assigned yet"}
          time="Today" dotColor={assignedRoutes > 0 ? "bg-sky-500" : "bg-slate-300"}
        />
      </div>

      {/* Completion bar */}
      <div className="border-t border-slate-50 px-6 py-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Clock size={13} className="text-slate-400" /> Daily Completion Rate
          </span>
          <span className="text-xs font-extrabold text-slate-900">{completionPct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-700 ${completionPct >= 80 ? "bg-emerald-500" : completionPct >= 50 ? "bg-indigo-500" : "bg-amber-400"}`}
            style={{ width: `${Math.min(completionPct, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          {completedToday} of {totalDeliveries || "—"} tasks completed today
        </p>
      </div>
    </div>
  );
}
