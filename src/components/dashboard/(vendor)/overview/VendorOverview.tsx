"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList, Shirt, Gauge, Banknote, TrendingUp,
  Star, Users, Store, ArrowRight,
  CheckCircle2, Wallet,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { OverviewStatCard }   from "@/components/dashboard/shared/overview/OverviewStatCard";
import { DashboardHeroBanner } from "@/components/dashboard/shared/overview/DashboardHeroBanner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewData {
  vendorId?: string;
  vendorCode?: string;
  businessName?: string;
  ownerName?: string;
  status?: string;
  isVerified?: boolean;
  assignedBranch?: { id: string; name: string } | null;
  totalOrders?: number;
  activeOrders?: number;
  completedOrders?: number;
  todayOrders?: number;
  walletBalance?: number;
  totalEarnings?: number;
  pendingSettlement?: number;
  completionRate?: number;
  acceptanceRate?: number;
  averageProcessingTime?: number;
  averageRating?: number;
  totalReviews?: number;
  // legacy fallbacks
  servicesCount?: number;
  capacityLimit?: number;
  totalEmployees?: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  const Sk = ({ className }: { className?: string }) => (
    <div className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`} />
  );
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
  href, Icon, title, sub,
}: {
  href: string;
  Icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 hover:border-ring/40 hover:bg-muted/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-105 transition-transform"
        style={{ color: "var(--primary)" }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <p className="text-[11px] font-medium text-muted-foreground leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="ml-auto shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

// ─── VendorOverview ───────────────────────────────────────────────────────────

export function VendorOverview() {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/vendor-dashboard/overview")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const walletBalance    = data?.walletBalance    ?? 0;
  const totalEarnings    = data?.totalEarnings    ?? 0;
  const activeOrders     = data?.activeOrders     ?? 0;
  const completedOrders  = data?.completedOrders  ?? 0;
  const todayOrders      = data?.todayOrders      ?? 0;
  const completionRate   = data?.completionRate   ?? 0;
  const averageRating    = data?.averageRating    ?? 0;
  const servicesCount    = data?.servicesCount    ?? 0;
  const capacityLimit    = data?.capacityLimit    ?? 150;
  const totalEmployees   = data?.totalEmployees   ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Banner ───────────────────────────────────────────────────── */}
      <DashboardHeroBanner
        badge={{ label: "Partner Vendor Workstation", liveLabel: "Verified Network Partner" }}
        title="Manage Orders & Scale Revenue"
        subtitle="Track delegated laundry processing queues, update daily capacity limits, manage staff, and withdraw earnings."
        chips={[
          { label: "Active Orders",  value: activeOrders                          },
          { label: "Payout Ready",   value: `৳${walletBalance.toLocaleString()}` },
          { label: "Today's Orders", value: todayOrders                           },
        ]}
        actions={
          <>
            <Link href="/dashboard/vendor-orders">
              <Button
                className="h-10 px-5 rounded-xl font-extrabold text-xs gap-2 shadow-lg transition-all hover:scale-[1.02]"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <ClipboardList size={15} /> Manage Delegated Orders
              </Button>
            </Link>
            <Link href="/dashboard/payouts">
              <Button
                variant="outline"
                className="h-10 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-2 backdrop-blur-md transition-all"
              >
                <Banknote size={15} /> Request Cash Payout
              </Button>
            </Link>
          </>
        }
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard label="Active Orders"    value={activeOrders}                            sub="Delegated in queue"  icon={ClipboardList} gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Total Earnings"   value={`৳${totalEarnings.toLocaleString()}`}   sub="Lifetime earnings"   icon={TrendingUp}    gradient="from-emerald-500 to-teal-600"  />
        <OverviewStatCard label="Completed Orders" value={completedOrders}                         sub="Successfully done"   icon={CheckCircle2}  gradient="from-violet-500 to-purple-600" />
        <OverviewStatCard label="Avg. Rating"      value={`${averageRating.toFixed(1)} / 5`}      sub="Customer satisfaction" icon={Star}         gradient="from-amber-400 to-orange-500"  />
      </div>

      {/* ── 3. Performance + Quick Actions ───────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Performance Metrics */}
        <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <Store size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-card-foreground">Vendor Performance Metrics</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Daily capacity, team size &amp; completion rates</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4">
            {([
              { label: "Services Offered", value: servicesCount,                         icon: Shirt,        gradient: "from-sky-500 to-cyan-600"      },
              { label: "Daily Capacity",   value: `${capacityLimit} kg`,                icon: Gauge,        gradient: "from-amber-400 to-orange-500"  },
              { label: "Team Members",     value: totalEmployees,                        icon: Users,        gradient: "from-violet-500 to-purple-600" },
              { label: "Completion Rate",  value: `${completionRate.toFixed(1)}%`,       icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600"  },
            ] as const).map(({ label, value, icon: Icon, gradient }) => (
              <div key={label} className="flex flex-col items-center justify-center gap-2.5 p-6">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-black text-card-foreground">{value as string | number}</p>
                <p className="text-[11px] font-extrabold text-muted-foreground text-center">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="md:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Vendor Workstation
            </h3>
            <div className="space-y-2">
              <QuickAction href="/dashboard/vendor-orders"    Icon={ClipboardList} title="Manage Orders"    sub="View and update order status"   />
              <QuickAction href="/dashboard/vendor-services"  Icon={Shirt}         title="My Services"      sub="Edit pricing & availability"    />
              <QuickAction href="/dashboard/vendor-capacity"  Icon={Gauge}         title="Set Capacity"     sub="Update daily processing limit"  />
              <QuickAction href="/dashboard/vendor-employees" Icon={Users}         title="Team Members"     sub="Manage your staff members"      />
              <QuickAction href="/dashboard/payouts"          Icon={Banknote}      title="Request Payout"   sub="Withdraw your earnings"         />
              <QuickAction href="/dashboard/vendor-wallet"    Icon={Wallet}        title="Wallet & Earnings" sub="View balance and payouts"      />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default VendorOverview;
