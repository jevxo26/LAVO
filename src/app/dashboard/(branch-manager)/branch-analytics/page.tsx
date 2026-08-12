"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import {
  CircleDollarSign, TrendingUp, BarChart3,
  RefreshCw, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="h-96 rounded-3xl bg-muted" />
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-black text-card-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-black text-card-foreground">৳{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchAnalytics() {
  const [data, setData]             = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res  = await authFetch("/branch-dashboard/analytics");
      const json = await res.json();
      if (json.success && json.data) setData(json.data);
    } catch (e) {
      console.error("Failed to fetch branch analytics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
    socket.on("garmentStatusUpdated", fetchAnalytics);
    socket.on("orderStatusUpdated",   fetchAnalytics);
    return () => { socket.disconnect(); };
  }, [fetchAnalytics]);

  if (loading) return <PageSkeleton />;

  if (!data) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <BarChart3 size={28} />
      </div>
      <p className="text-sm font-black text-card-foreground">No analytics data yet</p>
    </div>
  );

  const totals = data.totals || {
    totalRevenue:  data.revenue?.reduce((a: number, v: any) => a + v.total, 0) || 0,
    totalExpenses: data.expenses?.reduce((a: number, v: any) => a + v.total, 0) || 0,
    netProfit:     (data.revenue?.reduce((a: number, v: any) => a + v.total, 0) || 0) -
                   (data.expenses?.reduce((a: number, v: any) => a + v.total, 0) || 0),
  };

  const chartData = (data.revenue || []).map((rev: any, i: number) => {
    const exp = data.expenses?.[i]?.total || 0;
    return {
      name:     rev.name,
      revenue:  rev.total,
      expenses: exp,
      profit:   parseFloat((rev.total - exp).toFixed(2)),
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Branch Manager Portal"
        title="Branch Analytics & Financials"
        description="Real-time financial reports, revenue streams, and cost breakdown."
        icon={BarChart3}
        liveLabel="Live Data"
        chips={[
          { label: "Net Profit (7d)", value: `৳${totals.netProfit.toLocaleString()}` },
        ]}
      />

      {/* ── 2. KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <OverviewStatCard label="Total Revenue (7d)"  sub="Customer payments & bookings" value={`৳${totals.totalRevenue.toLocaleString()}`}  icon={CircleDollarSign} gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Expenses (7d)"       sub="Operational costs & splits"   value={`৳${totals.totalExpenses.toLocaleString()}`} icon={TrendingDown}     gradient="from-rose-500 to-pink-600"     />
        <OverviewStatCard label="Net Profit (7d)"     sub="Estimated branch margin"       value={`৳${totals.netProfit.toLocaleString()}`}    icon={TrendingUp}       gradient="from-emerald-500 to-teal-600"  />
      </div>

      {/* ── 3. Line Chart ────────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
              style={{ color: "var(--primary)" }}>
              <BarChart3 size={17} />
            </div>
            <div>
              <h2 className="text-sm font-black text-card-foreground">7-Day Financial Performance</h2>
              <p className="text-[11px] text-muted-foreground font-medium">Revenue vs expenses vs net profit trend</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-error" /> Expenses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Profit
            </span>
            <Button
              onClick={() => { setRefreshing(true); fetchAnalytics(); }}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-xl text-xs font-black gap-1.5 border-border hover:bg-muted ml-2"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
        <div className="p-4 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false}
                style={{ fill: "var(--muted-foreground)" }} />
              <YAxis fontSize={11} tickLine={false} axisLine={false}
                style={{ fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
              />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
              <Line type="monotone" dataKey="revenue"  stroke="var(--primary)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Revenue (৳)"    />
              <Line type="monotone" dataKey="expenses" stroke="var(--error)"   strokeWidth={2}   dot={false} activeDot={{ r: 4, strokeWidth: 0 }} name="Expenses (৳)"   />
              <Line type="monotone" dataKey="profit"   stroke="var(--success)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} name="Net Profit (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
