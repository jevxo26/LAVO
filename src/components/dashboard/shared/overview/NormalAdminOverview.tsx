"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { OverviewStatCard } from "./OverviewStatCard";
import {
  ClipboardList, Truck, PackageCheck, Headphones,
  Activity, ArrowUpRight, Clock, Sparkles, Building2, Layers,
  Store, Users, ShieldAlert, ArrowRight
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";

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
  new:      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900",
  ticket:   "bg-amber-50  text-amber-700  border-amber-200  dark:bg-amber-950/40  dark:text-amber-300  dark:border-amber-900",
  dispatch: "bg-sky-50    text-sky-700    border-sky-200    dark:bg-sky-950/40    dark:text-sky-300    dark:border-sky-900",
  done:     "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New", ticket: "Ticket", dispatch: "Dispatch", done: "Done",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${STATUS_STYLES[status] || STATUS_STYLES.new}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-xl text-xs dark:bg-slate-900 dark:border-slate-800">
      <span className="font-bold text-slate-900 dark:text-white">{d.name}: </span>
      <span className="text-indigo-600 dark:text-indigo-400 font-black">{d.value} orders</span>
    </div>
  );
}

// ─── Operational Shortcuts ───────────────────────────────────────────────────

const ADMIN_SHORTCUTS = [
  { title: "Live Order Dispatch", sub: "Manage & assign orders",   href: "/dashboard/customer-ops/live-orders", icon: ClipboardList, bg: "from-indigo-500 to-violet-600" },
  { title: "Support Tickets",     sub: "Customer help desk queue",  href: "/dashboard/support-tickets",          icon: Headphones,    bg: "from-sky-500 to-cyan-600"     },
  { title: "Partner Vendors",     sub: "Vendor capacity & network",  href: "/dashboard/partner-vendors",          icon: Store,         bg: "from-amber-400 to-orange-500"  },
  { title: "User Directory",      sub: "Customer & staff list",     href: "/dashboard/user-management",          icon: Users,         bg: "from-emerald-500 to-teal-600"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function NormalAdminOverview() {
  const [data, setData]       = useState<any>(null);
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
        <div className="h-52 w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Operations Command Hero Banner ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white shadow-2xl"
        style={{
          background: [
            "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 90% at 90% 20%, color-mix(in srgb, var(--secondary) 45%, transparent) 0%, transparent 55%)",
            "radial-gradient(ellipse 50% 60% at 60% 90%, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 50%)",
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
          ].join(", "),
          border: "1px solid color-mix(in srgb, white 18%, transparent)",
          boxShadow: "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-[0.55]"
            style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
          <div className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full blur-[70px] opacity-[0.45]"
            style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
          <div className="absolute top-1/2 left-[42%] h-44 w-44 -translate-y-1/2 rounded-full blur-[50px] opacity-[0.30]"
            style={{ background: "white" }} />
          <div className="absolute -top-8 -right-8 h-64 w-64 rounded-full opacity-[0.12]"
            style={{ border: "1.5px solid color-mix(in srgb, white 90%, transparent)", background: "transparent" }} />
          <div className="absolute top-1/2 left-[38%] h-28 w-28 -translate-y-1/2 rounded-full opacity-[0.10]"
            style={{ border: "1px solid white", background: "transparent" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)" }} />
          <div className="absolute inset-x-0 top-0 h-px opacity-[0.35]"
            style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                  color: "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
                }}>
                <Sparkles size={13} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
                Operations Command
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                Processing Live
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Admin Operations Workstation
            </h1>
            <p className="text-white/65 text-xs md:text-sm leading-relaxed font-medium">
              Monitor real-time order intake, branch throughput, agent logistics dispatching, and resolve support tickets.
            </p>
          </div>

          {/* Telemetry chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {[
              { label: "Today's Orders",  value: todaysOrders   },
              { label: "Pending Pickups", value: pendingPickups },
            ].map((chip) => (
              <div key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[125px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}>
                <p className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}>
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-0.5 tabular-nums">{chip.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewStatCard title="Today's Orders"    value={todaysOrders}     change="+12.5%"        isPositive  icon={ClipboardList} gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard title="Pending Pickups"   value={pendingPickups}   change="Needs dispatch" isPositive={false} icon={Truck}  gradient="from-amber-400 to-orange-500" />
        <OverviewStatCard title="Ready for Delivery" value={readyForDelivery} change="Ready in hub"  isPositive  icon={PackageCheck}  gradient="from-emerald-500 to-teal-600" />
        <OverviewStatCard title="Support Tickets"   value={activeTickets}    change="-3 resolved"    isPositive  icon={Headphones}    gradient="from-sky-500 to-cyan-600"     />
      </div>

      {/* ── 3. Operational Shortcuts Grid ────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Admin Shortcuts &amp; Controls
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADMIN_SHORTCUTS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 4. Main Grid: Donut Stage Distribution + Live Activity Stream ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Donut chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800">
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Order Stage Distribution</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Current operational volume breakdown</p>
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
                <span className="text-[1.8rem] font-black text-slate-900 dark:text-white leading-none">{donutTotal}</span>
                <span className="text-[11px] text-slate-400 font-extrabold mt-0.5">Total Orders</span>
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
                    <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-slate-900 dark:text-white font-black tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity table */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                <Activity size={16} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Live Operational Stream</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                  {["Ref ID", "Action", "Details", "User", "Status", "Time"].map((h, i) => (
                    <th key={h} className={`py-3.5 px-4 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400
                      ${i === 2 ? "hidden md:table-cell" : ""}
                      ${i === 3 ? "hidden lg:table-cell" : ""}
                      ${i === 5 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                    <td className="py-3.5 px-4 font-black text-indigo-600 dark:text-indigo-400 font-mono whitespace-nowrap">
                      {act.id}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {act.action}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-[180px] truncate font-medium">
                      {act.entity}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 hidden lg:table-cell whitespace-nowrap font-bold">
                      {typeof act.user === "string" ? act.user : act.user?.fullName || act.user?.email || "System"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={act.status || "new"} />
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {act.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/dashboard/customer-ops/live-orders"
              className="flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3
                text-xs font-black text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              View All Live Dispatch Orders <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
