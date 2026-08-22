"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  PackageCheck, QrCode, ClipboardList, Layers,
  Sparkles, ArrowRight,
  Shirt, Zap, Building2,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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

// ─── ActivityRow ──────────────────────────────────────────────────────────────

function ActivityRow({ Icon, title, sub, active }: {
  Icon: React.ElementType;
  title: string; sub: string; active: boolean;
}) {
  return (
    <div className="flex items-start gap-4 px-6 py-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
        active ? "bg-primary/10" : "bg-muted"
      }`} style={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-card-foreground leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">{sub}</p>
      </div>
      <span className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${
        active ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
      }`} />
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
      <div className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white shadow-2xl"
        style={{
          background: [
            "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 90% at 90% 20%, color-mix(in srgb, var(--secondary) 45%, transparent) 0%, transparent 55%)",
            "radial-gradient(ellipse 50% 60% at 60% 90%, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 50%)",
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
          ].join(", "),
          borderColor: "color-mix(in srgb, white 18%, transparent)",
          borderWidth: "1px",
          borderStyle: "solid",
          boxShadow: "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
        }}
      >
        {/* Bokeh orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-[0.55]"
            style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
          <div className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full blur-[70px] opacity-[0.45]"
            style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
          <div className="absolute top-1/2 left-[42%] h-44 w-44 -translate-y-1/2 rounded-full blur-[50px] opacity-[0.30]"
            style={{ background: "white" }} />
          <div className="absolute -top-8 -right-8 h-64 w-64 rounded-full opacity-[0.12]"
            style={{ border: "1.5px solid color-mix(in srgb, white 90%, transparent)", background: "transparent" }} />
          <div className="absolute top-1/2 left-[38%] h-28 w-28 -translate-y-1/2 rounded-full opacity-[0.10]"
            style={{ border: "1px solid white", background: "transparent" }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)" }} />
          <div className="absolute inset-x-0 top-0 h-px opacity-[0.35]"
            style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--primary) 25%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 45%, transparent)",
                  color: "color-mix(in srgb, var(--primary-foreground) 90%, var(--primary) 10%)",
                }}
              >
                <Sparkles size={13} style={{ color: "color-mix(in srgb, var(--primary-foreground) 70%, var(--primary))" }} />
                {isVendorEmployee ? "Vendor Processing Workstation" : "Branch Processing Workstation"}
              </span>

              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 40%, transparent)",
                  color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "var(--success)" }}
                />
                Scanner Active
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Welcome, {firstName}
            </h1>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed font-medium">
              Garment intake, QR tag scanning, washing stage transitions, and processing queue updates.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/dashboard/scanner">
                <Button
                  className="h-11 rounded-xl font-black text-xs px-6 gap-2.5 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                    color: "var(--primary)",
                    boxShadow: "0 4px 24px color-mix(in srgb, var(--primary) 25%, transparent)",
                  }}
                >
                  <QrCode size={17} /> Open QR Code Scanner Workstation
                </Button>
              </Link>
            </div>
          </div>

          {/* Telemetry chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {[
              { label: "Intake Today",    value: data?.intakeGarments ?? 0 },
              { label: "Dispatch Ready",  value: data?.readyDispatch  ?? 0 },
            ].map((chip) => (
              <div
                key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[125px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }}
                >
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-0.5 tabular-nums">{chip.value}</p>
              </div>
            ))}
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
        <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-card-foreground">Workstation Processing Pipeline</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Garment status telemetry &amp; live stage logs</p>
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
          <div className="divide-y divide-border">
            <ActivityRow Icon={PackageCheck}  title="Intake Garments Tagged" sub={`${data?.intakeGarments ?? 0} garments registered today`}               active={data?.intakeGarments  > 0} />
            <ActivityRow Icon={QrCode}        title="Pending Stage Scan"     sub={`${data?.pendingScan ?? 0} garments awaiting stage update`}              active={data?.pendingScan     > 0} />
            <ActivityRow Icon={Layers}        title="Washing Batches Active" sub={`${data?.washingBatches ?? 0} active batches in washers & dryers`}        active={data?.washingBatches  > 0} />
            <ActivityRow Icon={ClipboardList} title="Ready for Dispatch"     sub={`${data?.readyDispatch ?? 0} orders ironed & ready to go`}               active={data?.readyDispatch   > 0} />
          </div>
        </div>

        <div className="md:col-span-2 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Workstation Tools
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/scanner"       Icon={QrCode}       title="Open QR Scanner"    sub="Scan garment QR codes"     />
              <QuickAction href="/dashboard/intake-orders" Icon={PackageCheck} title="Garment Intake"     sub="Tag & register garments"   />
              <QuickAction href="/dashboard/intake-orders" Icon={Shirt}        title="Processing Orders"  sub="View washing & processing" />
              <QuickAction href="/dashboard/intake-orders" Icon={Building2}    title="Ready for Dispatch" sub="Ironed & ready orders"     />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default EmployeeOverview;
