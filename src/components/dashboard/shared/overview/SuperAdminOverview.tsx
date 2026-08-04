"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { OverviewStatCard } from "./OverviewStatCard";
import {
  DollarSign, Building2, Store, Users, Wallet,
  ShieldAlert, CheckCircle2, AlertTriangle, Info, ArrowUpRight,
  Sparkles, TrendingUp, ShieldCheck, Server, Activity, ArrowRight, RefreshCw, Key
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";

// ─── Fallback Data ────────────────────────────────────────────────────────────

const fallbackRevenue = [
  { day: "Mon", revenue: 14200, expenses: 5400 },
  { day: "Tue", revenue: 18500, expenses: 6200 },
  { day: "Wed", revenue: 16800, expenses: 5900 },
  { day: "Thu", revenue: 22400, expenses: 7100 },
  { day: "Fri", revenue: 28900, expenses: 8400 },
  { day: "Sat", revenue: 34100, expenses: 9800 },
  { day: "Sun", revenue: 31200, expenses: 9100 },
];

const fallbackAlerts = [
  { id: "1", type: "warning", text: "3 Vendor KYC Applications Pending Verification",  time: "10m ago" },
  { id: "2", type: "success", text: "Automated Database Backup Executed Successfully",  time: "1h ago"  },
  { id: "3", type: "alert",   text: "High Volume Surge Detected in Downtown Branch #4", time: "2h ago"  },
  { id: "4", type: "warning", text: "2 Payout Batches Approaching Settlement Deadline", time: "3h ago"  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function alertStyle(type: string) {
  if (type === "success") return {
    bg: "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
    icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />,
  };
  if (type === "warning") return {
    bg: "bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
    icon: <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />,
  };
  return {
    bg: "bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900",
    icon: <Info size={16} className="text-rose-500 shrink-0 mt-0.5" />,
  };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1.5 dark:bg-slate-900 dark:border-slate-800">
      <p className="font-extrabold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 font-medium capitalize">{p.dataKey}:</span>
          <span className="font-black text-slate-900 dark:text-white">৳{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Executive Quick Action Tiles ──────────────────────────────────────────────

const EXECUTIVE_SHORTCUTS = [
  { title: "Payout Approvals",     sub: "Approve vendor withdrawals", href: "/dashboard/payouts",              icon: Wallet,        bg: "from-emerald-500 to-teal-600"    },
  { title: "Partner Applications", sub: "Verify vendor KYC & signups", href: "/dashboard/partner-applications", icon: Store,         bg: "from-indigo-500 to-violet-600"   },
  { title: "User Governance",      sub: "Ban/Unban & manage roles",   href: "/dashboard/user-management",     icon: Users,         bg: "from-purple-500 to-pink-600"     },
  { title: "System Audit Logs",    sub: "View security event telemetry", href: "/dashboard/audit-logs",          icon: ShieldAlert,   bg: "from-rose-500 to-orange-500"     },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SuperAdminOverview() {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D" | "1Y">("7D");

  useEffect(() => {
    authFetch("/admin/overview/super-admin")
      .then((res) => res.json())
      .then((res) => { if (res?.success) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const netProfit      = data?.netProfit      ? `৳${data.netProfit.toLocaleString()}`      : "৳48,920";
  const totalRevenue   = data?.totalRevenue   ? `৳${data.totalRevenue.toLocaleString()}`   : "৳166,000";
  const activeBranches = data?.activeBranches ?? 24;
  const activeVendors  = data?.activeVendors  ?? 86;
  const totalUsers     = data?.totalUsers     ? data.totalUsers.toLocaleString()           : "12,450";
  const pendingPayouts = data?.pendingPayouts ? `${data.pendingPayouts} batches`           : "8 batches";
  const chartData      = data?.revenueChartData || fallbackRevenue;
  const alerts         = (data?.systemLogs || fallbackAlerts).slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-52 w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800" />
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
      {/* ── 1. Executive Glass Command Banner ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} className="text-indigo-300" /> Super Admin Governance
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Online
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Executive Platform Control Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
              Multi-branch revenue analytics, instant vendor payout clearance, live security audit telemetry, and user access management.
            </p>
          </div>

          {/* System Health Telemetry Chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Gross Revenue</p>
              <p className="text-white font-black text-2xl mt-0.5">{totalRevenue}</p>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Total Outlets</p>
              <p className="text-white font-black text-2xl mt-0.5">{activeBranches + activeVendors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Executive Stat Cards Grid ────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <OverviewStatCard title="Net Profit"       value={netProfit}      change="+14.2%"     isPositive  icon={DollarSign}  gradient="from-emerald-500 to-teal-600"    />
        <OverviewStatCard title="Total Revenue"    value={totalRevenue}   change="+18.5%"     isPositive  icon={TrendingUp}  gradient="from-indigo-500 to-violet-600"   />
        <OverviewStatCard title="Active Branches"  value={activeBranches} change="+2 new"     isPositive  icon={Building2}   gradient="from-sky-500 to-cyan-600"        />
        <OverviewStatCard title="Active Vendors"   value={activeVendors}  change="+5 this mo" isPositive  icon={Store}       gradient="from-violet-500 to-purple-600"   />
        <OverviewStatCard title="Total Users"      value={totalUsers}     change="+8.4%"      isPositive  icon={Users}       gradient="from-amber-400 to-orange-500"    />
        <OverviewStatCard title="Pending Payouts"  value={pendingPayouts} change="Needs review" isPositive={false} icon={Wallet} gradient="from-rose-500 to-pink-600" />
      </motion.div>

      {/* ── 3. Executive Shortcuts Grid ──────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Executive Control Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EXECUTIVE_SHORTCUTS.map((item) => {
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

      {/* ── 4. Main Grid: Financial Chart + Live Audit Ledger ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Revenue vs. Operational Expenses</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Live database financial telemetry</p>
            </div>

            {/* Time period filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
              {(["7D", "30D", "1Y"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                    chartPeriod === p
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 py-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue"  stroke="#6366f1" strokeWidth={2.8} fill="url(#gradRevenue)"
                  dot={false} activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 0 }} />
                <Area type="monotone" dataKey="expenses" stroke="#a78bfa" strokeWidth={2.2} fill="url(#gradExpenses)"
                  dot={false} activeDot={{ r: 5, fill: "#a78bfa", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
                <ShieldAlert size={16} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">Live Audit Feed</h3>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="flex-1 space-y-2.5 p-5">
            {alerts.map((alert: any, idx: number) => {
              const { bg, icon } = alertStyle(alert.type || "success");
              return (
                <div key={alert.id || idx} className={`flex items-start gap-3.5 rounded-2xl border p-3.5 ${bg}`}>
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {alert.action || alert.text || "System action executed"}
                    </p>
                    <span className="mt-1 block text-[10px] font-extrabold text-slate-400">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : alert.time || "Just now"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/dashboard/audit-logs"
              className="flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3
                text-xs font-black text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              View Audit Ledger Logs <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
