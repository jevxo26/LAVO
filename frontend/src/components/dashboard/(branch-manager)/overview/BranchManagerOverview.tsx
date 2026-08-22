"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  Package, Clock, CheckCircle2, Store, Layers,
  ArrowRight, RefreshCw, Gauge,
  BarChart3, Users, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import { DashboardHeroBanner } from "@/components/dashboard/shared/overview/DashboardHeroBanner";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`} />;
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

function QuickAction({ href, Icon, title, sub }: {
  href: string; Icon: React.ElementType;
  title: string; sub: string;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 hover:border-ring/40 hover:bg-muted/30 hover:shadow-md transition-all duration-200 group">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-105 transition-transform"
        style={{ color: "var(--primary)" }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <p className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1">
      <p className="font-black text-card-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground font-medium">{p.name}:</span>
          <span className="font-black text-card-foreground">{p.value} units</span>
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
    { name: "Used",      value: capacityPct,                    color: "var(--primary)"  },
    { name: "Available", value: Math.max(0, 100 - capacityPct), color: "var(--muted)"    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Branch Manager Command Banner ───────────────────────────────── */}
      <DashboardHeroBanner
        badge={{ label: "Branch Operational Control", liveLabel: "Machinery Active" }}
        title={`Welcome back, ${firstName}`}
        subtitle="Real-time branch processing capacity, live washer load, employee assignment, and vendor offloading."
        chips={[
          { label: "Capacity Used",  value: `${capacityPct}%`        },
          { label: "Active Orders",  value: data?.activeOrders ?? 0  },
        ]}
        actions={
          <Button
            onClick={() => { setRefreshing(true); fetchOverview(); }}
            className="h-10 px-4 rounded-xl font-black text-xs gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
              color: "var(--primary)",
            }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        }
      />

      {/* ── 2. Overflow Alert ───────────────────────────────────────────────── */}
      {isOverflow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-warning/30 bg-warning/8 p-6 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: "var(--warning)" }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-base font-black text-warning">
                High Volume Capacity Warning — {data?.activeOrders} Active Orders
              </p>
              <p className="text-xs font-medium text-warning/80 mt-0.5">
                Branch threshold exceeded. Immediately delegate overflow garments to verified partner vendors.
              </p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button
              className="h-10 px-5 rounded-xl text-white text-xs font-black gap-2 shrink-0 shadow-md transition-all hover:scale-[1.02]"
              style={{ background: "var(--warning)" }}
            >
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
        <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-card-foreground">Active Machinery Telemetry</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Live equipment status — Washers, Dryers &amp; Irons</p>
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
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.activeMachinery || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                <XAxis dataKey="type" fontSize={11} tickLine={false} axisLine={false}
                  style={{ fill: "var(--muted-foreground)" }} />
                <YAxis fontSize={11} tickLine={false} axisLine={false}
                  style={{ fill: "var(--muted-foreground)" }} />
                <RechartsTooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in srgb, var(--muted) 60%, transparent)" }} />
                <Bar dataKey="active" fill="var(--primary)" radius={[6,6,0,0]} name="Active Running" />
                <Bar dataKey="count"  fill="var(--muted)"   radius={[6,6,0,0]} name="Total Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Capacity Donut + Operations Hub */}
        <div className="md:col-span-3 space-y-5">

          {/* Capacity Donut Gauge */}
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <Gauge size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-card-foreground">Daily Capacity Gauge</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Limit vs. actual order volume</p>
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
                  <span className="text-2xl font-black text-card-foreground">{capacityPct}%</span>
                  <span className="text-[11px] text-muted-foreground font-extrabold">Utilization</span>
                </div>
              </div>
            </div>
            <div className="border-t border-border px-5 py-3.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(capacityPct, 100)}%`,
                    background: capacityPct >= 90 ? "var(--error)" : capacityPct >= 70 ? "var(--warning)" : "var(--primary)",
                  }}
                />
              </div>
              <p className="mt-2 text-[11px] font-bold text-muted-foreground">
                {capacityPct >= 90 ? "⚠️ High volume load — Delegate to Vendors" : capacityPct >= 70 ? "Moderate load — Monitor machinery" : "Capacity available"}
              </p>
            </div>
          </div>

          {/* Quick Operations Hub */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Quick Operations
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/branch-orders"    Icon={Package}   title="Branch Orders"   sub="View & manage active orders"     />
              <QuickAction href="/dashboard/partner-vendors"  Icon={Store}     title="Partner Vendors" sub="Delegate & monitor capacity"     />
              <QuickAction href="/dashboard/branch-analytics" Icon={BarChart3} title="Analytics"       sub="7-day financial overview"        />
              <QuickAction href="/dashboard/branch-employees" Icon={Users}     title="Employees"       sub="Manage branch staff"             />
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

export default BranchManagerOverview;
