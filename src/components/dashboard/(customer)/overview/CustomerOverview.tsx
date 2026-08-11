"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Radio, Zap } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import { DashboardHeroBanner } from "@/components/dashboard/shared/overview/DashboardHeroBanner";
import { OrderPipelineStepper } from "./OrderPipelineStepper";
import { GarmentCategoryCards } from "./GarmentCategoryCards";
import { RecentOrdersList } from "./RecentOrdersList";
import { WalletShortcutsPanel } from "./WalletShortcutsPanel";

import type { ActiveOrder } from "./OrderPipelineStepper";
import type { OrderRecord } from "./RecentOrdersList";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileStats {
  walletBalance: number;
  loyaltyPoints: number;
  activeOrdersCount: number;
  wishlistCount: number;
  customerCode: string;
  fullName: string;
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
        {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-32" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-96" />
        <Sk className="md:col-span-2 h-96" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerOverview() {
  const { user } = useAuth();

  const [stats, setStats]             = useState<ProfileStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statsError, setStatsError]   = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  const fetchCustomerData = useCallback(async () => {
    setStatsError(false);
    setOrdersError(false);
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        authFetch("/customer/profile"),
        authFetch("/customer/orders"),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json().catch(() => null);
        if (d?.success) setStats(d.data);
        else setStatsError(true);
      } else {
        setStatsError(true);
      }

      if (ordersRes.ok) {
        const d = await ordersRes.json().catch(() => null);
        if (d?.success) setRecentOrders(d.data ?? []);
        else setOrdersError(true);
      } else {
        setOrdersError(true);
      }
    } catch (err) {
      console.error("CustomerOverview fetch error:", err);
      setStatsError(true);
      setOrdersError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomerData(); }, [fetchCustomerData]);

  // ── States ──────────────────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton />;

  if (statsError && ordersError) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-error/10">
        <AlertCircle size={28} className="text-error" />
      </div>
      <p className="text-sm font-bold text-card-foreground">Could not load your dashboard</p>
      <p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p>
      <button
        onClick={fetchCustomerData}
        className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
        style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
      >
        <RefreshCw size={13} /> Retry
      </button>
    </div>
  );

  // ── Derived values ───────────────────────────────────────────────────────────

  const customerName = stats?.fullName?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Valued Customer";

  const activeOrder: ActiveOrder | undefined = recentOrders.find(
    (o) => !["COMPLETED", "CANCELLED", "DELIVERED"].includes(o.orderStatus.toUpperCase()),
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* 1. Hero Banner */}
      <DashboardHeroBanner
        badge={{ label: "VIP Gold Member" }}
        title={`Hello, ${customerName} 👋`}
        subtitle="Schedule express laundry pickups in 1-tap, track real-time garment cleaning stages, and unlock loyalty rewards."
        extra={
          stats?.customerCode ? (
            <span className="text-white/50 text-xs font-mono">#{stats.customerCode}</span>
          ) : undefined
        }
        chips={[
          {
            label: "Wallet Credit",
            value: `৳${(stats?.walletBalance ?? 0).toFixed(2)}`,
            sub: (
              <Link href="/dashboard/wallet" className="text-[10px] font-bold mt-1 inline-block hover:underline"
                style={{ color: "var(--secondary)" }}>
                + Top Up Cash
              </Link>
            ),
          },
          {
            label: "Reward Points",
            value: stats?.loyaltyPoints ?? 0,
            sub: <span className="text-[10px] font-bold mt-1 block" style={{ color: "var(--success)" }}>⭐ Gold Tier</span>,
          },
        ]}
        actions={
          <>
            <Link href="/dashboard/book-services">
              <Button
                className="h-10 px-5 rounded-xl font-extrabold text-xs gap-2 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                  color: "var(--primary)",
                  boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent)",
                }}
              >
                <Zap size={16} className="fill-current" /> Book Express Pickup
              </Button>
            </Link>
            <Link href="/dashboard/track-orders">
              <Button
                variant="outline"
                className="h-10 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-2 backdrop-blur-md transition-all"
              >
                <Radio size={15} className="animate-pulse" style={{ color: "var(--secondary)" }} /> Track Live Order
              </Button>
            </Link>
          </>
        }
      />

      {/* Partial failure banners */}
      {statsError && !ordersError && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-warning" />
          <p className="text-xs font-bold text-warning">
            Profile data could not be loaded. Wallet &amp; points may be unavailable.
          </p>
          <button onClick={fetchCustomerData} className="ml-auto shrink-0 text-xs font-extrabold text-warning underline">
            Retry
          </button>
        </div>
      )}
      {ordersError && !statsError && (
        <div className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/8 px-4 py-3">
          <AlertCircle size={16} className="shrink-0 text-warning" />
          <p className="text-xs font-bold text-warning">Orders could not be loaded.</p>
          <button onClick={fetchCustomerData} className="ml-auto shrink-0 text-xs font-extrabold text-warning underline">
            Retry
          </button>
        </div>
      )}

      {/* 2. Active Order Pipeline */}
      {activeOrder && <OrderPipelineStepper order={activeOrder} />}

      {/* 3. Garment Category Launcher */}
      <GarmentCategoryCards />

      {/* 4. Orders + Wallet grid */}
      <div className="grid gap-6 md:grid-cols-6 items-start">
        <RecentOrdersList orders={recentOrders} />
        <WalletShortcutsPanel
          walletBalance={stats?.walletBalance ?? 0}
          wishlistCount={stats?.wishlistCount ?? 0}
        />
      </div>
    </motion.div>
  );
}
