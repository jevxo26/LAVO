"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";

// ─── Fallback data ────────────────────────────────────────────────────────────
import {
  ClipboardList, Truck, PackageCheck, Headphones,
  Activity, ArrowUpRight, Clock,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// ─── Fallback data ────────────────────────────────────────────────────────────

const STAGE_COLORS = ["#f59e0b", "#6366f1", "#10b981"];

const fallbackStageData = [
  { name: "Pending Pickups",   value: 140, color: STAGE_COLORS[0] },
  { name: "In Processing",     value: 280, color: STAGE_COLORS[1] },
  { name: "Ready & Delivered", value: 410, color: STAGE_COLORS[2] },
];

const fallbackActivities = [
  { id: "ORD-9481", action: "New Order Placed",    entity: "Express Wash · 5 items",       user: "John Doe",       time: "5m ago",     status: "new"      },
  { id: "TCK-402",  action: "Support Ticket",       entity: "Delayed Delivery Inquiry",     user: "Sarah Jenkins",  time: "18m ago",    status: "ticket"   },
  { id: "AGT-12",   action: "Agent Dispatched",     entity: "Pickup Route #4",              user: "Alex (Agent)",   time: "32m ago",    status: "dispatch" },
  { id: "ORD-9478", action: "Order Completed",      entity: "Dry Cleaning & Press",         user: "Robert Vance",   time: "1h ago",     status: "done"     },
  { id: "ORD-9475", action: "Pickup Confirmed",     entity: "Bulk Uniform · 12 items",      user: "Maria Garcia",   time: "1h 20m ago", status: "dispatch" },
];

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  new:      "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  ticket:   "bg-amber-50  text-amber-700  border-amber-100  dark:bg-amber-950/40  dark:text-amber-300  dark:border-amber-900",
  dispatch: "bg-sky-50    text-sky-700    border-sky-100    dark:bg-sky-950/40    dark:text-sky-300    dark:border-sky-900",
  done:     "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};
const STATUS_LABELS: Record<string, string> = {
  new: "New", ticket: "Ticket", dispatch: "Dispatch", done: "Done",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status] || STATUS_STYLES.new}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <span className="font-bold text-foreground">{d.name}: </span>
      <span className="text-muted-foreground">{d.value} orders</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NormalAdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/admin/overview/normal-admin")
      .then((res) => res.json())
      .then((res) => { if (res?.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const todaysOrders     = data?.todaysTotalOrders    ?? 830;
  const pendingPickups   = data?.pendingPickups        ?? 140;
  const readyForDelivery = data?.readyForDelivery     ?? 95;
  const activeTickets    = data?.activeSupportTickets ?? 14;

  // Normalise stage colors: replace CSS vars with real hex
  const rawStage = data?.orderStageData || fallbackStageData;
  const stageData = rawStage.map((s: any, i: number) => ({
    ...s,
    color: s.color?.startsWith("var(") ? STAGE_COLORS[i % STAGE_COLORS.length] : (s.color || STAGE_COLORS[i % STAGE_COLORS.length]),
  }));
  const donutTotal = stageData.reduce((a: number, s: any) => a + (s.value || 0), 0);

  const activities: any[] = data?.recentOrders?.length
    ? data.recentOrders.map((ord: any) => ({
        id:     ord.orderNumber || `#${ord.id.slice(0, 7)}`,
        action: "Order Placed",
        entity: `${ord.orderType || "Standard Laundry"} · ${ord.totalGarments ?? 1} items`,
        user:   ord.customer?.user?.fullName || "Customer",
        time:   ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
        status: "new",
      }))
    : fallbackActivities;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[106px] rounded-2xl bg-muted" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-2xl bg-muted" />
          <div className="lg:col-span-2 h-96 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── 4 Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewStatCard title="Today's Orders"    value={todaysOrders}     change="+12.5%"        isPositive  icon={ClipboardList} gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard title="Pending Pickups"   value={pendingPickups}   change="Needs dispatch" isPositive={false} icon={Truck}  gradient="from-amber-400 to-orange-500" />
        <OverviewStatCard title="Ready for Delivery" value={readyForDelivery} change="Ready in hub"  isPositive  icon={PackageCheck}  gradient="from-emerald-500 to-teal-600" />
        <OverviewStatCard title="Support Tickets"   value={activeTickets}    change="-3 resolved"    isPositive  icon={Headphones}    gradient="from-sky-500 to-cyan-600"     />
      </div>

      {/* ── Donut + Activity table ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Donut chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 pt-5 pb-4 border-b border-border">
            <h3 className="font-bold text-foreground text-sm">Order Stage Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Current operational volume breakdown</p>
          </div>

          {/* Donut */}
          <div className="flex items-center justify-center py-6">
            <div className="relative h-52 w-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {stageData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.75rem] font-extrabold text-foreground leading-none">{donutTotal}</span>
                <span className="text-[11px] text-muted-foreground font-semibold mt-0.5">orders</span>
              </div>
            </div>
          </div>

          {/* Legend + progress bars */}
          <div className="px-5 pb-5 mt-auto space-y-3">
            {stageData.map((item: any) => {
              const pct = donutTotal > 0 ? Math.round((item.value / donutTotal) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-foreground tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity table */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Activity size={14} />
              </div>
              <h3 className="font-bold text-foreground text-sm">Live Operational Activity</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Ref ID", "Action", "Details", "User", "Status", "Time"].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground
                      ${i === 2 ? "hidden md:table-cell" : ""}
                      ${i === 3 ? "hidden lg:table-cell" : ""}
                      ${i === 5 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-muted/40 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 font-mono whitespace-nowrap">
                      {act.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground whitespace-nowrap">
                      {act.action}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                      {act.entity}
                    </td>
                    <td className="py-3.5 px-4 text-foreground hidden lg:table-cell whitespace-nowrap">
                      {typeof act.user === "string" ? act.user : act.user?.fullName || act.user?.email || "System"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={act.status || "new"} />
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={10} />
                        {act.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 pb-4 pt-3 border-t border-border">
            <a href="/admin/orders"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border bg-muted/40 py-2
                text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200">
              View all orders <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
