"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Shirt, Gauge, Banknote, TrendingUp,
  Star, Users, Store, ArrowRight, Sparkles,
  CheckCircle2, Package, Wallet, RefreshCw, ShieldCheck, Zap
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

interface OverviewData {
  activeOrders?: number;
  servicesCount?: number;
  capacityLimit?: number;
  availablePayout?: number;
  totalEarnings?: number;
  averageRating?: number;
  totalEmployees?: number;
  completionRate?: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-52 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-32" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-80" />
        <Sk className="md:col-span-2 h-80" />
      </div>
    </div>
  );
}

// ─── QuickAction ──────────────────────────────────────────────────────────────

function QuickAction({
  href, Icon, iconBg, iconColor, title, sub,
}: {
  href: string; Icon: React.ElementType;
  iconBg: string; iconColor: string;
  title: string; sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-md transition-all duration-200 group dark:bg-slate-900 dark:border-slate-800"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="ml-auto shrink-0 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// ─── VendorOverview ───────────────────────────────────────────────────────────

export function VendorOverview() {
  const [data, setData]     = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/vendor-dashboard/overview")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Partner Vendor Command Hero ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-purple-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} className="text-purple-300" /> Partner Vendor Workstation
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Verified Network Partner
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Manage Orders &amp; Scale Revenue
            </h1>
            <p className="text-purple-100 text-xs md:text-sm leading-relaxed font-medium">
              Track delegated laundry processing queues, update daily capacity limits, manage staff, and withdraw earnings.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard/vendor-orders">
                <Button className="h-11 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-6 shadow-lg shadow-purple-600/30 gap-2">
                  <ClipboardList size={16} /> Manage Delegated Orders
                </Button>
              </Link>
              <Link href="/dashboard/payouts">
                <Button variant="outline" className="h-11 rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs px-5 gap-2 backdrop-blur-md">
                  <Banknote size={16} /> Request Cash Payout
                </Button>
              </Link>
            </div>
          </div>

          {/* Live Telemetry Chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-purple-200 text-[10px] font-black uppercase tracking-wider">Active Orders</p>
              <p className="text-white font-black text-2xl mt-0.5">{data?.activeOrders ?? 0}</p>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-purple-200 text-[10px] font-black uppercase tracking-wider">Payout Ready</p>
              <p className="text-white font-black text-2xl mt-0.5">৳{(data?.availablePayout ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard label="Active Orders"    value={data?.activeOrders ?? 0}                     change="Delegated in queue" isPositive icon={ClipboardList} gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Total Earnings"  value={`৳${(data?.totalEarnings ?? 0).toLocaleString()}`} change="Lifetime earnings"  isPositive icon={TrendingUp}    gradient="from-emerald-500 to-teal-600" />
        <OverviewStatCard label="Available Payout" value={`৳${(data?.availablePayout ?? 0).toLocaleString()}`} change="Ready to withdraw" isPositive icon={Banknote}      gradient="from-violet-500 to-purple-600" />
        <OverviewStatCard label="Avg. Rating"     value={`${(data?.averageRating ?? 5.0).toFixed(1)} / 5`} change="Top satisfaction"  isPositive icon={Star}          gradient="from-amber-400 to-orange-500" />
      </div>

      {/* ── 3. Main Grid: Performance Metrics + Quick Actions ───────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Performance Overview */}
        <div className="md:col-span-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Vendor Performance Metrics</h3>
                <p className="text-[11px] text-slate-400 font-medium">Daily capacity limits, team size, and completion rates</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 dark:divide-slate-800">
            {[
              { label: "Services Offered", value: data?.servicesCount ?? 0,               icon: Shirt,        color: "text-sky-600",     bg: "bg-sky-50 dark:bg-sky-950/50"     },
              { label: "Daily Capacity",   value: `${data?.capacityLimit ?? 150} kg`,    icon: Gauge,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/50"   },
              { label: "Team Members",     value: data?.totalEmployees ?? 0,              icon: Users,        color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/50"  },
              { label: "Completion Rate",  value: `${(data?.completionRate ?? 98.5).toFixed(1)}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2.5 p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg} ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-[11px] font-extrabold text-slate-400 text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Quick Actions */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vendor Workstation Actions
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/vendor-orders"   Icon={ClipboardList} iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Manage Orders"    sub="View and update order status"   />
              <QuickAction href="/dashboard/vendor-services" Icon={Shirt}         iconBg="bg-sky-50"     iconColor="text-sky-600"     title="My Services"      sub="Edit pricing & availability"    />
              <QuickAction href="/dashboard/vendor-capacity" Icon={Gauge}         iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Set Capacity"     sub="Update daily processing limit"  />
              <QuickAction href="/dashboard/vendor-employees" Icon={Users}        iconBg="bg-violet-50"  iconColor="text-violet-600"  title="Team Members"     sub="Manage your staff members"      />
              <QuickAction href="/dashboard/payouts"         Icon={Banknote}      iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Request Payout"   sub="Withdraw your earnings"         />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VendorOverview;
