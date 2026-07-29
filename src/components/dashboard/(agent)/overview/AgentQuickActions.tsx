"use client";

import Link from "next/link";
import { PackageCheck, Truck, Route, ShieldCheck, History, ArrowRight, Sparkles } from "lucide-react";

function QuickAction({ href, Icon, iconBg, iconColor, title, sub, badge }: {
  href: string; Icon: React.ElementType;
  iconBg: string; iconColor: string;
  title: string; sub: string; badge?: number;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-100 hover:bg-indigo-50/30 hover:shadow-sm transition-all duration-150 group">
      <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={16} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white text-[9px] font-extrabold ring-2 ring-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={13} className="shrink-0 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all duration-150" />
    </Link>
  );
}

interface Props {
  availablePickups: number;
  activeDeliveries: number;
}

export function AgentQuickActions({ availablePickups, activeDeliveries }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
          <Sparkles size={13} className="text-violet-500" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-900">Quick Actions</h2>
          <p className="text-[11px] text-slate-400">Jump to any section</p>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <QuickAction href="/dashboard/pickups"      Icon={PackageCheck} iconBg="bg-amber-50"   iconColor="text-amber-600"   title="Available Pickups" sub="View & accept requests"    badge={availablePickups}  />
        <QuickAction href="/dashboard/deliveries"   Icon={Truck}        iconBg="bg-indigo-50"  iconColor="text-indigo-600"  title="Deliveries"        sub="Manage active drop-offs"  badge={activeDeliveries}  />
        <QuickAction href="/dashboard/agent-routes" Icon={Route}        iconBg="bg-sky-50"     iconColor="text-sky-600"     title="Optimized Routes"  sub="Today's route plan"                                 />
        <QuickAction href="/dashboard/verification" Icon={ShieldCheck}  iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Verification"      sub="OTP delivery confirm"                               />
        <QuickAction href="/dashboard/history"      Icon={History}      iconBg="bg-violet-50"  iconColor="text-violet-600"  title="History"           sub="Past pickups & deliveries"                           />
      </div>
    </div>
  );
}
