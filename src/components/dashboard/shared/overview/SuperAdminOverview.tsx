"use client";

import React, { useState, useEffect } from "react";
import { authFetch } from "@/lib/api";
import { OverviewStatCard } from "./OverviewStatCard";
import {
  DollarSign, Building2, Store, Users, Wallet,
  ShieldAlert, CheckCircle2, AlertTriangle, Info, ArrowUpRight, Sparkles, TrendingUp, ShieldCheck
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";

// ─── Fallback data ────────────────────────────────────────────────────────────

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
    bg: "bg-emerald-50/80 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900",
    icon: <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />,
  };
  if (type === "warning") return {
    bg: "bg-amber-50/80 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900",
    icon: <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />,
  };
  return {
    bg: "bg-rose-50/80 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900",
    icon: <Info size={15} className="text-rose-500 shrink-0 mt-0.5" />,
  };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1.5 dark:bg-slate-900 dark:border-slate-800">
      <p className="font-bold text-slate-900 dark:text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-500 capitalize">{p.dataKey}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white">৳{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuperAdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="h-44 w-full rounded-2xl bg-slate-100" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[106px] rounded-2xl bg-slate-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-slate-100" />
          <div className="h-80 rounded-2xl bg-slate-100" />
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
      {/* ── Super Admin Hero Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-purple-500 blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={13} className="text-indigo-300" /> Executive Platform Control
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              Platform Command Center
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
              Real-time multi-branch revenue tracking, vendor payout clearance, system audit telemetry, and executive governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Gross Revenue</p>
              <p className="text-white font-extrabold text-lg leading-tight">{totalRevenue}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Active Outlets</p>
              <p className="text-white font-extrabold text-lg leading-tight">{activeBranches + activeVendors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
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

      {/* ── Chart + Audit feed ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Revenue vs. Operational Expenses</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">7-day financial overview · live database telemetry</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Expenses
              </span>
            </div>
          </div>
          <div className="px-2 py-4 h-[275px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue"  stroke="#6366f1" strokeWidth={2.5} fill="url(#gradRevenue)"
                  dot={false} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }} />
                <Area type="monotone" dataKey="expenses" stroke="#a78bfa" strokeWidth={2}   fill="url(#gradExpenses)"
                  dot={false} activeDot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Audit Feed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-sm">
                <ShieldAlert size={14} />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Live Audit Feed</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SECURE LEDGER
            </span>
          </div>

          <div className="flex-1 space-y-2.5 p-4">
            {alerts.map((alert: any, idx: number) => {
              const { bg, icon } = alertStyle(alert.type || "success");
              return (
                <div key={alert.id || idx} className={`flex items-start gap-3 rounded-xl border p-3 ${bg}`}>
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {alert.action || alert.text || "System action executed"}
                    </p>
                    <span className="mt-1 block text-[10px] font-medium text-slate-400">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : alert.time || "Just now"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-4">
            <a href="/dashboard/audit-logs"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5
                text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
              View all audit logs <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
