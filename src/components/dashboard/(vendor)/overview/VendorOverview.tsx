"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Shirt, Gauge, Banknote, TrendingUp,
  Star, Users, Store, ArrowRight, Sparkles,
  CheckCircle2, Package, Wallet, RefreshCw,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-64 rounded-2xl" />
        <Sk className="md:col-span-2 h-64 rounded-2xl" />
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
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
          <Icon size={20} />
        </div>
        <Link href={href} className={`flex items-center gap-1 text-[11px] font-bold ${iconColor} hover:underline`}>
          {linkLabel} <ArrowRight size={11} />
        </Link>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="mt-0.5 text-[12px] font-semibold text-slate-600 leading-tight">{label}</p>
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
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-100 hover:shadow-sm transition-all group"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={13} className="ml-auto shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors" />
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
    <div className="space-y-7">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-10">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Partner Vendor Portal
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Manage your orders &amp; grow your business
            </h1>
            <p className="text-indigo-200 text-sm">
              Track incoming orders, monitor capacity, manage your team, and receive payouts — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/dashboard/vendor-orders">
                <Button className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-5 shadow-sm gap-2">
                  <ClipboardList size={15} /> View Orders
                </Button>
              </Link>
              <Link href="/dashboard/vendor-capacity">
                <Button variant="outline" className="h-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium text-sm px-5 gap-2">
                  <Gauge size={14} /> Capacity
                </Button>
              </Link>
            </div>
          </div>

          {/* Live stat chips */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Active Orders</p>
              <p className="text-white font-extrabold text-lg leading-tight">{data?.activeOrders ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Payout</p>
              <p className="text-white font-extrabold text-lg leading-tight">৳{(data?.availablePayout ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Rating</p>
              <p className="text-white font-extrabold text-lg leading-tight">{(data?.averageRating ?? 0).toFixed(1)} ★</p>
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
          label="Avg. Rating"     value={`${(data?.averageRating ?? 0).toFixed(1)} / 5`}
          sub="Customer satisfaction"  href="/dashboard/vendor-orders"   linkLabel="Orders"
          Icon={Star}             iconBg="bg-amber-50"   iconColor="text-amber-600"   ringColor="ring-amber-100"
        />
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Performance summary */}
        <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Store size={14} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Performance Overview</h2>
                <p className="text-[11px] text-slate-400">Capacity, team, and service metrics</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-50 sm:grid-cols-4">
            {[
              { label: "Services",       value: data?.servicesCount ?? 0,               icon: Shirt,        color: "text-sky-600",     bg: "bg-sky-50"     },
              { label: "Daily Capacity", value: `${data?.capacityLimit ?? 0} kg`,        icon: Gauge,        color: "text-amber-600",   bg: "bg-amber-50"   },
              { label: "Team Members",   value: data?.totalEmployees ?? 0,              icon: Users,        color: "text-violet-600",  bg: "bg-violet-50"  },
              { label: "Completion",     value: `${(data?.completionRate ?? 0).toFixed(1)}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2 p-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg} ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xl font-extrabold text-slate-900">{value}</p>
                <p className="text-[11px] font-semibold text-slate-400 text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2 space-y-5">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                <Sparkles size={13} className="text-violet-500" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2.5">
              <QuickAction href="/dashboard/vendor-orders"   Icon={ClipboardList} iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Manage Orders"    sub="View and update order status"   />
              <QuickAction href="/dashboard/vendor-services" Icon={Shirt}         iconBg="bg-sky-50"     iconColor="text-sky-600"     title="My Services"      sub="Edit pricing & availability"    />
              <QuickAction href="/dashboard/vendor-capacity" Icon={Gauge}         iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Set Capacity"     sub="Update daily processing limit"  />
              <QuickAction href="/dashboard/vendor-employees" Icon={Users}        iconBg="bg-violet-50"  iconColor="text-violet-600"  title="Team"             sub="Manage your staff members"      />
              <QuickAction href="/dashboard/payouts"         Icon={Banknote}      iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Request Payout"   sub="Withdraw your earnings"         />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorOverview;
