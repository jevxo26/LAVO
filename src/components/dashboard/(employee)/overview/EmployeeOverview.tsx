"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck, QrCode, ClipboardList, Layers,
  Store, Sparkles, CheckCircle2, ArrowRight,
  Shirt, Zap, Building2, Users, ShieldCheck
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

// ─── ActivityRow ──────────────────────────────────────────────────────────────

function ActivityRow({ Icon, iconBg, iconColor, title, sub, dotColor }: {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; sub: string; dotColor: string;
}) {
  return (
    <div className="flex items-start gap-4 px-6 py-4.5">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} mt-0.5`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{sub}</p>
      </div>
      <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
    </div>
  );
}

// ─── EmployeeOverview ─────────────────────────────────────────────────────────

export function EmployeeOverview() {
  const { user } = useAuth();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await authFetch("/employee-dashboard/overview");
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const json = await res.json();
          if (json.success) setData(json.data);
        }
      } catch (e) {
        console.warn("Could not load employee overview stats:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <PageSkeleton />;

  const isVendorEmployee =
    (user as any)?.vendorId ||
    (user as any)?.employerType === "VENDOR" ||
    (user as any)?.employeeType === "VENDOR" ||
    data?.isVendorEmployee;

  const firstName = user?.fullName?.split(" ")[0] || "Employee";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Employee Workstation Command Hero ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} className="text-indigo-300" /> {isVendorEmployee ? "Vendor Processing Workstation" : "Branch Processing Workstation"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Scanner Active
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Welcome, {firstName}
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium">
              Garment intake, QR tag scanning, washing stage transitions, and processing queue updates.
            </p>

            <div className="pt-2">
              <Link href="/dashboard/scanner">
                <Button className="h-12 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs px-7 shadow-xl shadow-white/10 gap-2.5 transition-all hover:scale-[1.02]">
                  <QrCode size={18} /> Open QR Code Scanner Workstation
                </Button>
              </Link>
            </div>
          </div>

          {/* Telemetry Chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Intake Today</p>
              <p className="text-white font-black text-2xl mt-0.5">{data?.intakeGarments ?? 0}</p>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[125px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Dispatch Ready</p>
              <p className="text-white font-black text-2xl mt-0.5">{data?.readyDispatch ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewStatCard label="Intake Today"       sub="Tagged & registered"    value={data?.intakeGarments ?? 0} icon={PackageCheck}  gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Pending Stage Scan" sub="Awaiting stage update"  value={data?.pendingScan ?? 0}    icon={QrCode}        gradient="from-amber-400 to-orange-500" />
        <OverviewStatCard label="Washing Batches"    sub="In washers & dryers"    value={data?.washingBatches ?? 0} icon={Layers}        gradient="from-blue-500 to-cyan-600" />
        <OverviewStatCard label="Ready for Dispatch" sub="Ironed & bagged"        value={data?.readyDispatch ?? 0}  icon={ClipboardList} gradient="from-emerald-500 to-teal-600" />
      </div>

      {/* ── 3. Main Grid: Workstation Telemetry + Quick Tools ───────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">
        <div className="md:col-span-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Workstation Processing Pipeline</h3>
                <p className="text-[11px] text-slate-400 font-medium">Garment status telemetry &amp; live stage logs</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <ActivityRow Icon={PackageCheck}  iconBg="bg-indigo-50 dark:bg-indigo-950/50"  iconColor="text-indigo-600 dark:text-indigo-400"  title="Intake Garments Tagged" sub={`${data?.intakeGarments ?? 0} garments registered today`}  dotColor={data?.intakeGarments > 0  ? "bg-indigo-500" : "bg-slate-300"} />
            <ActivityRow Icon={QrCode}        iconBg="bg-amber-50 dark:bg-amber-950/50"   iconColor="text-amber-600 dark:text-amber-400"   title="Pending Stage Scan"     sub={`${data?.pendingScan ?? 0} garments awaiting stage update`}           dotColor={data?.pendingScan > 0     ? "bg-amber-500"  : "bg-slate-300"} />
            <ActivityRow Icon={Layers}        iconBg="bg-blue-50 dark:bg-blue-950/50"    iconColor="text-blue-600 dark:text-blue-400"    title="Washing Batches Active" sub={`${data?.washingBatches ?? 0} active batches in washers & dryers`}    dotColor={data?.washingBatches > 0  ? "bg-blue-500"   : "bg-slate-300"} />
            <ActivityRow Icon={ClipboardList} iconBg="bg-emerald-50 dark:bg-emerald-950/50" iconColor="text-emerald-600 dark:text-emerald-400" title="Ready for Dispatch"     sub={`${data?.readyDispatch ?? 0} orders ironed & ready to go`}           dotColor={data?.readyDispatch > 0   ? "bg-emerald-500": "bg-slate-300"} />
          </div>
        </div>

        <div className="md:col-span-2 space-y-5">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workstation Tools
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/scanner"                  Icon={QrCode}       iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Open QR Scanner"    sub="Scan garment QR codes"        />
              <QuickAction href="/dashboard/intake-orders"  Icon={PackageCheck} iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Garment Intake"     sub="Tag & register garments"      />
              <QuickAction href="/dashboard/intake-orders"  Icon={Shirt}        iconBg="bg-blue-50"    iconColor="text-blue-600"    title="Processing Orders"  sub="View washing & processing"    />
              <QuickAction href="/dashboard/intake-orders"  Icon={Building2}    iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Ready for Dispatch" sub="Ironed & ready orders"        />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EmployeeOverview;
