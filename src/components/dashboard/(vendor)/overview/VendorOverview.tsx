"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Shirt, Gauge, Banknote, TrendingUp,
  Star, Users, Store, ArrowRight, Sparkles,
  CheckCircle2, Package, Wallet, RefreshCw, ShieldCheck
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-28" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-64" />
        <Sk className="md:col-span-2 h-64" />
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, href, linkLabel,
  Icon, iconBg, iconColor, ringColor,
}: {
  label: string; value: string | number; sub: string;
  href: string; linkLabel: string;
  Icon: React.ElementType;
  iconBg: string; iconColor: string; ringColor: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
          <Icon size={20} />
        </div>
        <Link href={href} className={`flex items-center gap-1 text-[11px] font-extrabold ${iconColor} hover:underline`}>
          {linkLabel} <ArrowRight size={11} />
        </Link>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="mt-1 text-[12px] font-bold text-slate-700 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
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
      className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all group"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={13} className="ml-auto shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
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
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-900 px-7 py-9 text-white shadow-xl border border-indigo-700/40">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">
                Partner Vendor Workstation
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage Orders &amp; Scale Business
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
              Track incoming laundry delegations, set daily processing capacity, manage employees, and request wallet payouts.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/dashboard/vendor-orders">
                <Button className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-5 shadow-md gap-2">
                  <ClipboardList size={15} /> View Orders
                </Button>
              </Link>
              <Link href="/dashboard/payouts">
                <Button variant="outline" className="h-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-xs px-5 gap-2 backdrop-blur-md">
                  <Banknote size={15} /> Request Payout
                </Button>
              </Link>
            </div>
          </div>

          {/* Live stat chips */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Active Orders</p>
              <p className="text-white font-extrabold text-xl leading-tight">{data?.activeOrders ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Payout Ready</p>
              <p className="text-white font-extrabold text-xl leading-tight">৳{(data?.availablePayout ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Rating</p>
              <p className="text-white font-extrabold text-xl leading-tight">{(data?.averageRating ?? 5.0).toFixed(1)} ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Orders"    value={data?.activeOrders ?? 0}
          sub="Assigned & processing"  href="/dashboard/vendor-orders"   linkLabel="View All"
          Icon={ClipboardList}    iconBg="bg-indigo-50"  iconColor="text-indigo-600"  ringColor="ring-indigo-100"
        />
        <StatCard
          label="Total Earnings"  value={`৳${(data?.totalEarnings ?? 0).toLocaleString()}`}
          sub="Lifetime net earnings"  href="/dashboard/vendor-wallet"   linkLabel="Wallet"
          Icon={TrendingUp}       iconBg="bg-emerald-50" iconColor="text-emerald-600" ringColor="ring-emerald-100"
        />
        <StatCard
          label="Available Payout" value={`৳${(data?.availablePayout ?? 0).toLocaleString()}`}
          sub="Ready for withdrawal"   href="/dashboard/payouts"          linkLabel="Request"
          Icon={Banknote}         iconBg="bg-violet-50"  iconColor="text-violet-600"  ringColor="ring-violet-100"
        />
        <StatCard
          label="Avg. Rating"     value={`${(data?.averageRating ?? 5.0).toFixed(1)} / 5`}
          sub="Customer satisfaction"  href="/dashboard/vendor-orders"   linkLabel="Orders"
          Icon={Star}             iconBg="bg-amber-50"   iconColor="text-amber-600"   ringColor="ring-amber-100"
        />
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Performance summary */}
        <div className="md:col-span-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Store size={15} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Performance Metrics Overview</h2>
                <p className="text-[11px] text-slate-400">Capacity limit, team size, and completion rates</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4">
            {[
              { label: "Services Offered", value: data?.servicesCount ?? 0,               icon: Shirt,        color: "text-sky-600",     bg: "bg-sky-50"     },
              { label: "Daily Capacity",   value: `${data?.capacityLimit ?? 150} kg`,    icon: Gauge,        color: "text-amber-600",   bg: "bg-amber-50"   },
              { label: "Team Members",     value: data?.totalEmployees ?? 0,              icon: Users,        color: "text-violet-600",  bg: "bg-violet-50"  },
              { label: "Completion Rate",  value: `${(data?.completionRate ?? 98.5).toFixed(1)}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2 p-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg} ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xl font-extrabold text-slate-900">{value}</p>
                <p className="text-[11px] font-bold text-slate-500 text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <Sparkles size={14} className="text-violet-600" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">Quick Operations</h2>
            </div>
            <div className="p-4 space-y-2.5">
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
