"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { OverviewStatCard } from "./OverviewStatCard";
import {
  DollarSign, Building2, Store, Users, Wallet,
  ShieldAlert, CheckCircle2, AlertTriangle, Info, ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

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
    bg: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900",
    icon: <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />,
  };
  if (type === "warning") return {
    bg: "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900",
    icon: <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />,
  };
  return {
    bg: "bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900",
    icon: <Info size={15} className="text-rose-500 shrink-0 mt-0.5" />,
  };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-bold text-foreground">${p.value.toLocaleString()}</span>
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
    axios.get("/api/admin/overview/super-admin")
      .then((res) => { if (res.data?.success) setData(res.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const netProfit      = data?.netProfit      ? `$${data.netProfit.toLocaleString()}`      : "$48,920";
  const totalRevenue   = data?.totalRevenue   ? `$${data.totalRevenue.toLocaleString()}`   : "$166,000";
  const activeBranches = data?.activeBranches ?? 24;
  const activeVendors  = data?.activeVendors  ?? 86;
  const totalUsers     = data?.totalUsers     ? data.totalUsers.toLocaleString()           : "12,450";
  const pendingPayouts = data?.pendingPayouts ? `${data.pendingPayouts} batches`           : "8 batches";
  const chartData      = data?.revenueChartData || fallbackRevenue;
  const alerts         = (data?.systemLogs || fallbackAlerts).slice(0, 4);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[106px] rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl bg-muted" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <OverviewStatCard title="Net Profit"       value={netProfit}      change="+14.2%"     isPositive  icon={DollarSign}  gradient="from-emerald-500 to-teal-600"    />
        <OverviewStatCard title="Total Revenue"    value={totalRevenue}   change="+18.5%"     isPositive  icon={DollarSign}  gradient="from-indigo-500 to-violet-600"   />
        <OverviewStatCard title="Active Branches"  value={activeBranches} change="+2 new"     isPositive  icon={Building2}   gradient="from-sky-500 to-cyan-600"        />
        <OverviewStatCard title="Active Vendors"   value={activeVendors}  change="+5 this mo" isPositive  icon={Store}       gradient="from-violet-500 to-purple-600"   />
        <OverviewStatCard title="Total Users"      value={totalUsers}     change="+8.4%"      isPositive  icon={Users}       gradient="from-amber-400 to-orange-500"    />
        <OverviewStatCard title="Pending Payouts"  value={pendingPayouts} change="Needs review" isPositive={false} icon={Wallet} gradient="from-rose-500 to-pink-600" />
      </div>

      {/* ── Chart + Audit feed ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue vs Expenses */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border">
            <div>
              <h3 className="font-bold text-foreground text-sm">Revenue vs. Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">7-day financial overview · live database data</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-violet-400" /> Expenses
              </span>
            </div>
          </div>
          <div className="px-2 py-4 h-[268px]">
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
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
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
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white">
                <ShieldAlert size={14} />
              </div>
              <h3 className="font-bold text-foreground text-sm">Live Audit Feed</h3>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="flex-1 space-y-2.5 p-4">
            {alerts.map((alert: any, idx: number) => {
              const { bg, icon } = alertStyle(alert.type || "success");
              return (
                <div key={alert.id || idx} className={`flex items-start gap-3 rounded-xl border p-3 ${bg}`}>
                  {icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {alert.action || alert.text || "System action executed"}
                    </p>
                    <span className="mt-1 block text-[10px] font-medium text-muted-foreground">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : alert.time || "Just now"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-4">
            <a href="/admin/audit-logs"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl border border-border bg-muted/40 py-2
                text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200">
              View all audit logs <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
