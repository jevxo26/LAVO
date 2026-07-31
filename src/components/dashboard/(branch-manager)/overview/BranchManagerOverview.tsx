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
  BarChart3, Users, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-28" />)}</div>
      <div className="grid gap-6 md:grid-cols-7">
        <Sk className="md:col-span-4 h-72" />
        <Sk className="md:col-span-3 h-72" />
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
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-100 hover:bg-indigo-50/30 hover:shadow-sm transition-all duration-150 group">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={13} className="shrink-0 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-xl text-xs space-y-1">
      <p className="font-bold text-slate-900">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-900">{p.value}</span>
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
    <div className="space-y-7">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-9">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Branch Manager Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-indigo-200 text-sm">
              Real-time capacity tracking, live order load, and active machinery status.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {[
              { label: "Capacity",  value: `${capacityPct}%`                        },
              { label: "Active",    value: data?.activeOrders          ?? 0          },
              { label: "Vendors",   value: data?.vendorDelegatedOrders ?? "—"        },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
              </div>
            ))}
            <Button onClick={() => { setRefreshing(true); fetchOverview(); }}
              className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 shadow-sm gap-1.5">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── Overflow alert ──────────────────────────────────────────────── */}
      {isOverflow && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">High Order Volume — {data?.activeOrders} Active Orders</p>
              <p className="text-xs text-amber-700 mt-0.5">Branch threshold of 5 orders exceeded. Delegate overflow to partner vendors.</p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button size="sm" className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shrink-0">
              View Vendors <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Capacity Utilization", sub: "Of daily limit",              value: `${capacityPct}%`,                  Icon: Package,      iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
          { label: "Active Processing",    sub: "Currently in progress",        value: `${data?.activeOrders ?? 0}`,       Icon: Clock,        iconBg: "bg-blue-50",    iconColor: "text-blue-600",    ringColor: "ring-blue-100"    },
          { label: "Pending Orders",       sub: "Awaiting pickup / confirm",    value: `${data?.pendingOrders ?? 0}`,      Icon: CheckCircle2, iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
          { label: "Vendor Delegated",     sub: "Sent to branch vendors",       value: `${data?.vendorDelegatedOrders ?? 0}`, Icon: Store,     iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
        ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts + Quick actions ───────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-7 items-start">

        {/* Machinery bar chart */}
        <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Layers size={14} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Active Machinery Load</h2>
                <p className="text-[11px] text-slate-400">Live machines running — Washers, Dryers, Irons</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.activeMachinery || []} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="active" fill="#6366f1" radius={[4,4,0,0]} name="Active" />
                <Bar dataKey="count"  fill="#e2e8f0" radius={[4,4,0,0]} name="Total"  />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right col: capacity donut + quick actions */}
        <div className="md:col-span-3 space-y-5">

          {/* Capacity donut */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <Gauge size={14} className="text-violet-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Capacity Breakdown</h2>
                <p className="text-[11px] text-slate-400">Daily maximum utilization</p>
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
                  <span className="text-2xl font-extrabold text-slate-900">{capacityPct}%</span>
                  <span className="text-[11px] text-slate-400 font-semibold">Used</span>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="border-t border-slate-50 px-5 py-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all duration-700 ${capacityPct >= 90 ? "bg-rose-500" : capacityPct >= 70 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${Math.min(capacityPct, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {capacityPct >= 90 ? "⚠️ Near full capacity" : capacityPct >= 70 ? "Moderate load" : "Capacity available"}
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Sparkles size={13} className="text-indigo-500" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <QuickAction href="/dashboard/branch-orders"        Icon={Package}   iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Branch Orders"        sub="View & manage active orders"     />
              <QuickAction href="/dashboard/partner-vendors"      Icon={Store}     iconBg="bg-violet-50"  iconColor="text-violet-600"  title="Partner Vendors"      sub="Delegate & monitor capacity"     />
              <QuickAction href="/dashboard/branch-analytics"     Icon={BarChart3} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Analytics"            sub="7-day financial overview"        />
              <QuickAction href="/dashboard/branch-employees"     Icon={Users}     iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Employees"            sub="Manage branch staff"             />
              <QuickAction href="/dashboard/partner-applications" Icon={CheckCircle2} iconBg="bg-sky-50"  iconColor="text-sky-600"     title="Partner Applications" sub="Review vendor applications"      />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BranchManagerOverview;
