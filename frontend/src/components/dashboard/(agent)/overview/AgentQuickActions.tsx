"use client";

import Link from "next/link";
import { PackageCheck, Truck, Route, ShieldCheck, History, ArrowRight, Zap } from "lucide-react";

function QuickAction({ href, Icon, title, sub, badge }: {
  href: string; Icon: React.ElementType;
  title: string; sub: string; badge?: number;
}) {
  return (
    <Link href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 hover:border-ring/40 hover:bg-muted/30 hover:shadow-sm transition-all duration-150 group">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-105 transition-transform"
        style={{ color: "var(--primary)" }}>
        <Icon size={16} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-black ring-2 ring-card"
            style={{ background: "var(--error)" }}>
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-black text-card-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={13} className="shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-150" />
    </Link>
  );
}

interface Props {
  availablePickups: number;
  activeDeliveries: number;
}

export function AgentQuickActions({ availablePickups, activeDeliveries }: Props) {
  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
          style={{ color: "var(--primary)" }}>
          <Zap size={16} />
        </div>
        <div>
          <h2 className="text-sm font-black text-card-foreground">Quick Actions</h2>
          <p className="text-[11px] text-muted-foreground font-medium">Jump to any section</p>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <QuickAction href="/dashboard/pickups"      Icon={PackageCheck} title="Available Pickups" sub="View & accept requests"     badge={availablePickups}  />
        <QuickAction href="/dashboard/deliveries"   Icon={Truck}        title="Deliveries"        sub="Manage active drop-offs"   badge={activeDeliveries}  />
        <QuickAction href="/dashboard/agent-routes" Icon={Route}        title="Optimized Routes"  sub="Today's route plan"                                  />
        <QuickAction href="/dashboard/verification" Icon={ShieldCheck}  title="Verification"      sub="OTP delivery confirm"                                />
        <QuickAction href="/dashboard/history"      Icon={History}      title="History"           sub="Past pickups & deliveries"                            />
      </div>
    </div>
  );
}
