"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Package, Clock, CheckCircle2, Store, Layers,
  Sparkles, ArrowRight, RefreshCw, Gauge,
  BarChart3, Users, AlertTriangle, ShieldCheck, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-52 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-32" />)}</div>
      <div className="grid gap-6 md:grid-cols-7">
        <Sk className="md:col-span-4 h-96" />
        <Sk className="md:col-span-3 h-96" />
      </div>
    </div>
  );
}

// ─── QuickAction ──────────────────────────────────────────────────────────────

function QuickAction({ href, Icon, iconBg, iconColor, title, sub }: {
  href: string; Icon: React.ElementType;
  iconBg: string; iconColor: string;
  title: string; sub: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md transition-all duration-200 group dark:bg-slate-900 dark:border-slate-800">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1 dark:bg-slate-900 dark:border-slate-800">
      <p className="font-black text-slate-900 dark:text-white">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-slate-500 font-medium">{p.name}:</span>
          <span className="font-black text-slate-900 dark:text-white">{p.value} units</span>
        </div>
      ))}
    </div>
  );
}

// ─── BranchManagerOverview ───────────────────────────────────────────────────

export function BranchManagerOverview() {
  const { user } = useAuth();
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res  = await authFetch("/branch-dashboard/overview");
      const json = await res.json();
      if (json.success && json.data) setData(json.data);
    } catch (e) {
      console.error("Failed to fetch branch overview:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
    socket.on("garmentStatusUpdated", fetchOverview);
    socket.on("orderStatusUpdated",   fetchOverview);
    return () => { socket.disconnect(); };
  }, [fetchOverview]);

  if (loading) return <PageSkeleton />;

  const capacityPct  = parseFloat(data?.capacityUtilization || "0");
  const firstName    = user?.fullName?.split(" ")[0] || "Manager";
  const isOverflow   = (data?.activeOrders ?? 0) > 5;

  const capacityData = [
    { name: "Used",      value: capacityPct,                      color: "#6366f1" },
    { name: "Available", value: Math.max(0, 100 - capacityPct),   color: "#e2e8f0" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Branch Manager Command Banner ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} className="text-indigo-300" /> Branch Operational Control
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Machinery Active
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium">
              Real-time branch processing capacity, live washer load, employee assignment, and vendor offloading.
            </p>
          </div>

          {/* Live Capacity Telemetry Chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[120px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Capacity Used</p>
              <p className="text-white font-black text-2xl mt-0.5">{capacityPct}%</p>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[120px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Active Orders</p>
              <p className="text-white font-black text-2xl mt-0.5">{data?.activeOrders ?? 0}</p>
            </div>

            <Button onClick={() => { setRefreshing(true); fetchOverview(); }}
              className="h-10 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-md gap-2 transition-all hover:scale-[1.02]">
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh Telemetry
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Overflow Alert ───────────────────────────────────────────────── */}
      {isOverflow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-6 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-base font-black text-amber-900 dark:text-amber-300">
                High Volume Capacity Warning — {data?.activeOrders} Active Orders
              </p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                Branch threshold exceeded. Immediately delegate overflow garments to verified partner vendors.
              </p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black gap-2 shrink-0 shadow-md transition-all hover:scale-[1.02]">
              Delegate to Vendors <ArrowRight size={14} />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* ── 3. Stat Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewStatCard title="Capacity Utilization" subLabel="Of daily limit"              value={`${capacityPct}%`}                  icon={Package}      gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard title="Active Processing"    subLabel="Currently in progress"        value={`${data?.activeOrders ?? 0}`}       icon={Clock}        gradient="from-blue-500 to-cyan-600" />
        <OverviewStatCard title="Pending Orders"       subLabel="Awaiting pickup / confirm"    value={`${data?.pendingOrders ?? 0}`}      icon={CheckCircle2} gradient="from-amber-400 to-orange-500" />
        <OverviewStatCard title="Vendor Delegated"     subLabel="Sent to branch vendors"       value={`${data?.vendorDelegatedOrders ?? 0}`} icon={Store}     gradient="from-violet-500 to-purple-600" />
      </div>

      {/* ── 4. Main Grid: Machinery Load Bar Chart + Capacity Gauge ─────────── */}
      <div className="grid gap-6 md:grid-cols-7 items-start">

        {/* Machinery Bar Chart */}
        <div className="md:col-span-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Machinery Telemetry</h3>
                <p className="text-[11px] text-slate-400 font-medium">Live equipment status — Washers, Dryers &amp; Irons</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.activeMachinery || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="active" fill="#6366f1" radius={[6,6,0,0]} name="Active Running" />
                <Bar dataKey="count"  fill="#e2e8f0" radius={[6,6,0,0]} name="Total Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Capacity Donut + Operations Hub */}
        <div className="md:col-span-3 space-y-5">

          {/* Capacity Donut Gauge */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Gauge size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Daily Capacity Gauge</h3>
                <p className="text-[11px] text-slate-400 font-medium">Limit vs. actual order volume</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-4 h-[180px]">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={capacityData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {capacityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{capacityPct}%</span>
                  <span className="text-[11px] text-slate-400 font-extrabold">Utilization</span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-3.5 dark:border-slate-800">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-full rounded-full transition-all duration-700 ${capacityPct >= 90 ? "bg-rose-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(capacityPct, 100)}%` }} />
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {capacityPct >= 90 ? "⚠️ High volume load — Delegate to Vendors" : capacityPct >= 70 ? "Moderate load — Monitor machinery" : "Capacity available"}
              </p>
            </div>
          </div>

          {/* Quick Operations Hub */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Operations
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/branch-orders"        Icon={Package}   iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Branch Orders"        sub="View & manage active orders"     />
              <QuickAction href="/dashboard/partner-vendors"      Icon={Store}     iconBg="bg-violet-50"  iconColor="text-violet-600"  title="Partner Vendors"      sub="Delegate & monitor capacity"     />
              <QuickAction href="/dashboard/branch-analytics"     Icon={BarChart3} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Analytics"            sub="7-day financial overview"        />
              <QuickAction href="/dashboard/branch-employees"     Icon={Users}     iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Employees"            sub="Manage branch staff"             />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default BranchManagerOverview;
