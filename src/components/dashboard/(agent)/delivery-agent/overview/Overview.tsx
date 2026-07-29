"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Truck, PackageCheck, CheckCircle2, Clock,
  Sparkles, ArrowRight, MapPin, ShieldCheck,
  History, Route, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-28 rounded-2xl" />)}</div>
      <div className="grid gap-6 md:grid-cols-6"><Sk className="md:col-span-4 h-64 rounded-2xl" /><Sk className="md:col-span-2 h-64 rounded-2xl" /></div>
    </div>
  );
}

// ─── QuickAction ──────────────────────────────────────────────────────────────

function QuickAction({ href, Icon, iconBg, iconColor, title, sub }: {
  href: string; Icon: React.ElementType; iconBg: string; iconColor: string; title: string; sub: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-100 hover:shadow-sm transition-all group">
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

// ─── Overview ─────────────────────────────────────────────────────────────────

export default function Overview() {
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem("laundrix_token");
      const res = await axios.get("/api/delivery-agent/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAgent(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);

  if (loading) return <PageSkeleton />;

  const statusDot = agent?.status === "ACTIVE"
    ? "bg-emerald-500"
    : agent?.status === "ON_DELIVERY" ? "bg-blue-500" : "bg-slate-400";

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
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Delivery Agent Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, {user?.fullName?.split(" ")[0] || "Agent"}
            </h1>
            <p className="text-indigo-200 text-sm">
              Manage your assigned pickups, deliveries, and optimized routes — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/dashboard/pickups">
                <Button className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-5 shadow-sm gap-2">
                  <PackageCheck size={15} /> Available Pickups
                </Button>
              </Link>
              <Link href="/dashboard/deliveries">
                <Button variant="outline" className="h-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-medium text-sm px-5 gap-2">
                  <Truck size={14} /> Deliveries
                </Button>
              </Link>
            </div>
          </div>

          {/* Live stat chips */}
          {agent && (
            <div className="flex flex-wrap gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Completed</p>
                <p className="text-white font-extrabold text-lg leading-tight">{agent.completedDeliveries ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">In Progress</p>
                <p className="text-white font-extrabold text-lg leading-tight">{agent.inProgressDeliveries ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Status</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={`h-2 w-2 rounded-full ${statusDot}`} />
                  <p className="text-white font-bold text-xs leading-tight">{agent.status ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── No data state ────────────────────────────────────────────────── */}
      {!agent ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Truck size={38} className="text-indigo-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No delivery data found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            You don't have any pickups or deliveries assigned yet. Your overview will appear once an administrator assigns tasks.
          </p>
        </div>
      ) : (
        <>
          {/* ── Stat cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Deliveries",  sub: "All time",             value: agent.totalDeliveries    ?? 0, Icon: Truck,         iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
              { label: "Pending",           sub: "Not yet started",      value: agent.pendingDeliveries  ?? 0, Icon: Clock,         iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
              { label: "In Progress",       sub: "Currently active",     value: agent.inProgressDeliveries ?? 0, Icon: PackageCheck, iconBg: "bg-blue-50",   iconColor: "text-blue-600",    ringColor: "ring-blue-100"    },
              { label: "Completed",         sub: "Successfully done",    value: agent.completedDeliveries ?? 0, Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
            ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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

          {/* ── Info + Quick actions ─────────────────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-6 items-start">

            {/* Agent info card */}
            <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <Truck size={14} className="text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Agent Information</h2>
                  <p className="text-[11px] text-slate-400">Your profile and performance summary</p>
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-y divide-slate-50 sm:grid-cols-4">
                {[
                  { label: "Name",          value: user?.fullName ?? "—" },
                  { label: "Agent ID",      value: agent.agentId ?? "—" },
                  { label: "Employee Code", value: agent.employeeCode ?? "—" },
                  { label: "Phone",         value: agent.phone ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col justify-center gap-1 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
                  </div>
                ))}
              </div>
              {/* Performance bar */}
              <div className="border-t border-slate-50 px-6 py-5 space-y-3">
                {[
                  { label: "Completion",  value: agent.totalDeliveries > 0 ? Math.round((agent.completedDeliveries / agent.totalDeliveries) * 100) : 0, color: "bg-emerald-500" },
                  { label: "In Progress", value: agent.totalDeliveries > 0 ? Math.round((agent.inProgressDeliveries / agent.totalDeliveries) * 100) : 0, color: "bg-blue-500"    },
                  { label: "Pending",     value: agent.totalDeliveries > 0 ? Math.round((agent.pendingDeliveries / agent.totalDeliveries) * 100) : 0,    color: "bg-amber-400"  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{label}</span>
                      <span className="font-extrabold text-slate-900">{value}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="md:col-span-2 space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                    <Sparkles size={13} className="text-violet-500" />
                  </div>
                  <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2.5">
                  <QuickAction href="/dashboard/pickups"      Icon={PackageCheck} iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Available Pickups"  sub="View pickup requests"       />
                  <QuickAction href="/dashboard/deliveries"   Icon={Truck}        iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Deliveries"         sub="Manage active deliveries"   />
                  <QuickAction href="/dashboard/agent-routes" Icon={Route}        iconBg="bg-blue-50"    iconColor="text-blue-600"    title="Optimized Routes"   sub="View today's route plan"    />
                  <QuickAction href="/dashboard/verification" Icon={ShieldCheck}  iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Verification"       sub="OTP delivery verification"  />
                  <QuickAction href="/dashboard/history"      Icon={History}      iconBg="bg-violet-50"  iconColor="text-violet-600"  title="History"            sub="Past pickups & deliveries"  />
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
