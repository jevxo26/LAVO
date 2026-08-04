"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck, QrCode, ClipboardList, Layers,
  Store, Sparkles, CheckCircle2, ArrowRight,
  Shirt, Zap, Building2, Users,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-28" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-56" />
        <Sk className="md:col-span-2 h-56" />
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({ label, sub, value, Icon, iconBg, iconColor, ringColor, valueColor }: {
  label: string; sub: string; value: string | number;
  Icon: React.ElementType; iconBg: string; iconColor: string;
  ringColor: string; valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-extrabold leading-none ${valueColor ?? "text-slate-900"}`}>{value}</p>
        <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
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
      <ArrowRight size={13} className="shrink-0 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-150" />
    </Link>
  );
}

// ─── ActivityRow ──────────────────────────────────────────────────────────────

function ActivityRow({ Icon, iconBg, iconColor, title, sub, dotColor }: {
  Icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; sub: string; dotColor: string;
}) {
  return (
    <div className="flex items-start gap-3 px-6 py-4">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor} mt-0.5`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-900 leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
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

  // ── Vendor Employee ──────────────────────────────────────────────────────────
  if (isVendorEmployee) {
    return (
      <div className="space-y-7">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-pink-700 px-7 py-9">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white" />
          </div>
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-violet-200" />
                <span className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Processing Workstation</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Welcome, {firstName}
              </h1>
              <p className="text-violet-200 text-sm">
                Delegated vendor orders, garment processing, quality inspection, and hub dispatch.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-violet-200 text-[10px] font-semibold uppercase tracking-wider">Assigned</p>
                <p className="text-white font-extrabold text-xl leading-tight">{data?.assignedOrders ?? 0}</p>
              </div>
              <Link href="/dashboard/scanner">
                <Button className="h-10 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-sm px-5 shadow-sm gap-2">
                  <QrCode size={15} /> QR Scanner
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Assigned Orders"   sub="Vendor hub orders"    value={data?.assignedOrders ?? 0}  Icon={ClipboardList} iconBg="bg-violet-50"  iconColor="text-violet-600"  ringColor="ring-violet-100"  />
          <StatCard label="Quality Check"     sub="Under QC inspection"  value={data?.qualityCheck ?? 0}    Icon={Sparkles}      iconBg="bg-amber-50"   iconColor="text-amber-600"   ringColor="ring-amber-100"   />
          <StatCard label="Steam & Ironing"   sub="In finishing station" value={data?.ironingStage ?? 0}    Icon={Layers}        iconBg="bg-blue-50"    iconColor="text-blue-600"    ringColor="ring-blue-100"    />
          <StatCard label="Ready for Dispatch" sub="Vendor completed"    value={data?.vendorCompleted ?? 0} Icon={CheckCircle2}  iconBg="bg-emerald-50" iconColor="text-emerald-600" ringColor="ring-emerald-100" valueColor="text-emerald-600" />
        </div>

        {/* Activity + Quick actions */}
        <div className="grid gap-6 md:grid-cols-6 items-start">
          <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50"><Zap size={14} className="text-violet-500" /></div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Processing Activity</h2>
                  <p className="text-[11px] text-slate-400">Current vendor workstation status</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              <ActivityRow Icon={ClipboardList} iconBg="bg-violet-50"  iconColor="text-violet-600"  title="Assigned Orders"    sub={`${data?.assignedOrders ?? 0} vendor orders in your queue`}      dotColor={data?.assignedOrders > 0 ? "bg-violet-400"  : "bg-slate-300"} />
              <ActivityRow Icon={Sparkles}      iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Quality Inspection" sub={`${data?.qualityCheck ?? 0} garments under quality check`}        dotColor={data?.qualityCheck > 0    ? "bg-amber-400"   : "bg-slate-300"} />
              <ActivityRow Icon={Layers}        iconBg="bg-blue-50"    iconColor="text-blue-600"    title="Steam & Ironing"    sub={`${data?.ironingStage ?? 0} garments in finishing station`}        dotColor={data?.ironingStage > 0    ? "bg-blue-400"    : "bg-slate-300"} />
              <ActivityRow Icon={CheckCircle2}  iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Hub Dispatch Ready"  sub={`${data?.vendorCompleted ?? 0} orders ready for branch return`}   dotColor={data?.vendorCompleted > 0 ? "bg-emerald-500" : "bg-slate-300"} />
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50"><Sparkles size={13} className="text-violet-500" /></div>
              <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <QuickAction href="/dashboard/scanner"                         Icon={QrCode}       iconBg="bg-violet-50"  iconColor="text-violet-600"  title="QR Scanner"         sub="Scan & tag garments"          />
              <QuickAction href="/dashboard/intake-orders"         Icon={PackageCheck} iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Intake Orders"      sub="View assigned orders"         />
              <QuickAction href="/dashboard/intake-orders"         Icon={Store}        iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Vendor Orders"      sub="Vendor processing queue"      />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Branch Employee ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-7">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-9">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Branch Workstation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome, {firstName}
            </h1>
            <p className="text-indigo-200 text-sm">
              Garment intake, QR tag scanning, washing stage transitions, and processing status.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Intake</p>
              <p className="text-white font-extrabold text-xl leading-tight">{data?.intakeGarments ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Ready</p>
              <p className="text-white font-extrabold text-xl leading-tight">{data?.readyDispatch ?? 0}</p>
            </div>
            <Link href="/dashboard/scanner">
              <Button className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-5 shadow-sm gap-2">
                <QrCode size={15} /> QR Scanner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Intake Today"       sub="Tagged & registered"    value={data?.intakeGarments ?? 0} Icon={PackageCheck}  iconBg="bg-indigo-50"  iconColor="text-indigo-600"  ringColor="ring-indigo-100"  />
        <StatCard label="Pending Stage Scan" sub="Awaiting stage update"  value={data?.pendingScan ?? 0}    Icon={QrCode}        iconBg="bg-amber-50"   iconColor="text-amber-600"   ringColor="ring-amber-100"   />
        <StatCard label="Washing Batches"    sub="In washers & dryers"    value={data?.washingBatches ?? 0} Icon={Layers}        iconBg="bg-blue-50"    iconColor="text-blue-600"    ringColor="ring-blue-100"    />
        <StatCard label="Ready for Dispatch" sub="Ironed & bagged"        value={data?.readyDispatch ?? 0}  Icon={ClipboardList} iconBg="bg-emerald-50" iconColor="text-emerald-600" ringColor="ring-emerald-100" valueColor="text-emerald-600" />
      </div>

      {/* Activity + Quick actions */}
      <div className="grid gap-6 md:grid-cols-6 items-start">
        <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50"><Zap size={14} className="text-indigo-500" /></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Workstation Activity</h2>
                <p className="text-[11px] text-slate-400">Current branch processing status</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            <ActivityRow Icon={PackageCheck}  iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Intake Garments"    sub={`${data?.intakeGarments ?? 0} garments tagged & registered today`}  dotColor={data?.intakeGarments > 0  ? "bg-indigo-500" : "bg-slate-300"} />
            <ActivityRow Icon={QrCode}        iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Pending Stage Scan" sub={`${data?.pendingScan ?? 0} garments awaiting stage update`}           dotColor={data?.pendingScan > 0     ? "bg-amber-400"  : "bg-slate-300"} />
            <ActivityRow Icon={Layers}        iconBg="bg-blue-50"    iconColor="text-blue-600"    title="Washing Batches"    sub={`${data?.washingBatches ?? 0} active batches in washers & dryers`}    dotColor={data?.washingBatches > 0  ? "bg-blue-500"   : "bg-slate-300"} />
            <ActivityRow Icon={ClipboardList} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Ready for Dispatch" sub={`${data?.readyDispatch ?? 0} orders ironed, bagged & ready to go`}   dotColor={data?.readyDispatch > 0   ? "bg-emerald-500": "bg-slate-300"} />
          </div>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50"><Sparkles size={13} className="text-indigo-500" /></div>
            <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            <QuickAction href="/dashboard/scanner"                  Icon={QrCode}       iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Open QR Scanner"    sub="Scan garment QR codes"        />
            <QuickAction href="/dashboard/intake-orders"  Icon={PackageCheck} iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Garment Intake"     sub="Tag & register garments"      />
            <QuickAction href="/dashboard/intake-orders"  Icon={Shirt}        iconBg="bg-blue-50"    iconColor="text-blue-600"    title="Processing Orders"  sub="View washing & processing"    />
            <QuickAction href="/dashboard/intake-orders"  Icon={Building2}    iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Ready for Dispatch" sub="Ironed & ready orders"        />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeOverview;
