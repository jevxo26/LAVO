"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import {
  CircleDollarSign, TrendingUp, BarChart3,
  Sparkles, RefreshCw, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full" />
      <div className="grid grid-cols-3 gap-4">{[0,1,2].map((i) => <Sk key={i} className="h-28" />)}</div>
      <Sk className="h-96" />
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold text-slate-900">৳{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchAnalytics() {
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <BarChart3 size={38} className="text-slate-300 mb-4" />
      <p className="text-sm font-bold text-slate-700">No analytics data yet</p>
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
    return { name: rev.name, revenue: rev.total, expenses: exp, profit: parseFloat((rev.total - exp).toFixed(2)) };
  });

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-emerald-200" />
              <span className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest">Branch Manager Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Branch Analytics & Financials</h1>
            <p className="mt-1 text-sm text-emerald-100">Real-time financial reports, revenue streams, and cost breakdown.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Net Profit</p>
              <p className="text-white font-extrabold text-xl leading-tight">৳{totals.netProfit.toLocaleString()}</p>
            </div>
            <Button onClick={() => { setRefreshing(true); fetchAnalytics(); }}
              className="h-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm px-4 shadow-sm gap-1.5">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue (7d)",           sub: "Customer payments & bookings",  value: totals.totalRevenue,  Icon: CircleDollarSign, iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100",  valueColor: "text-slate-900"    },
          { label: "Expenses & Commissions (7d)",  sub: "Operational costs & splits",    value: totals.totalExpenses, Icon: TrendingDown,     iconBg: "bg-rose-50",    iconColor: "text-rose-600",    ringColor: "ring-rose-100",    valueColor: "text-slate-900"    },
          { label: "Net Profit (7d)",              sub: "Estimated branch margin",        value: totals.netProfit,     Icon: TrendingUp,       iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100", valueColor: "text-emerald-600"  },
        ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor, valueColor }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-extrabold leading-none ${valueColor}`}>৳{value.toLocaleString()}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart ─────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
              <BarChart3 size={14} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">7-Day Financial Performance</h2>
              <p className="text-[11px] text-slate-400">Revenue vs expenses vs net profit trend</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" />Expenses</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Profit</span>
          </div>
        </div>
        <div className="p-4 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
              <RechartsTooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="revenue"  stroke="#6366f1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }} name="Revenue (৳)"   />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2}   dot={false} activeDot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }} name="Expenses (৳)"  />
              <Line type="monotone" dataKey="profit"   stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }} name="Net Profit (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
