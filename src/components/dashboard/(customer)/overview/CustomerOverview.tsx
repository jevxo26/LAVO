"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet, Sparkles, ShoppingBag, Heart,
  ArrowRight, Calendar, Clock, Shirt,
  CreditCard, TicketCheck, Radio,
  Package, CheckCircle2, AlertCircle,
  Zap, Award, ChevronRight, RefreshCw
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileStats {
  walletBalance: number;
  loyaltyPoints: number;
  activeOrdersCount: number;
  wishlistCount: number;
  customerCode: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  totalGarments: number;
}

// ─── Pipeline Stepper Stages ──────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { id: "PENDING",    label: "Placed",      icon: Package      },
  { id: "PICKUP",     label: "Picked Up",   icon: Clock        },
  { id: "PROCESSING", label: "Washing",     icon: RefreshCw    },
  { id: "READY",      label: "Quality Check", icon: CheckCircle2 },
  { id: "DELIVERED",  label: "Delivered",   icon: Award        },
];

function getStageIndex(status: string): number {
  const s = status.toUpperCase();
  if (s === "PENDING") return 0;
  if (s === "CONFIRMED" || s === "PICKUP") return 1;
  if (s === "PROCESSING" || s === "WASHING") return 2;
  if (s === "READY" || s === "READY_FOR_DELIVERY" || s === "DELIVERY") return 3;
  if (s === "COMPLETED" || s === "DELIVERED") return 4;
  return 1;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function orderStatusStyle(status: string): { cls: string; dot: string } {
  switch (status.toUpperCase()) {
    case "PENDING":    return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse"  };
    case "CONFIRMED":  return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary"                };
    case "PROCESSING":
    case "WASHING":
    case "PICKUP":     return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary animate-pulse"  };
    case "DELIVERY":   return { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary animate-pulse" };
    case "COMPLETED":  return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success"                };
    case "CANCELLED":  return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"                  };
    default:           return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50"    };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-52 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-32" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-96" />
        <Sk className="md:col-span-2 h-96" />
      </div>
    </div>
  );
}

// ─── Garment Category Quick Launcher ─────────────────────────────────────────

const GARMENT_CATEGORIES = [
  { name: "Shirts & Tops",  price: "From ৳40", icon: Shirt,        bg: "from-blue-500 to-indigo-600" },
  { name: "Suits & Coats",  price: "From ৳250", icon: Award,       bg: "from-purple-500 to-violet-600" },
  { name: "Bedding & Linen", price: "From ৳180", icon: Package,    bg: "from-emerald-500 to-teal-600" },
  { name: "Curtains & Rugs", price: "From ৳350", icon: RefreshCw,  bg: "from-amber-400 to-orange-500" },
];

// ─── CustomerOverview Component ──────────────────────────────────────────────

export function CustomerOverview() {
  const { user }                        = useAuth();
  const [stats, setStats]               = useState<ProfileStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);

  const fetchCustomerData = async () => {
    setError(false);
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        authFetch("/customer/profile"),
        authFetch("/customer/orders"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json().catch(() => null);
        if (statsData?.success) setStats(statsData.data);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json().catch(() => null);
        if (ordersData?.success) setRecentOrders((ordersData.data ?? []).slice(0, 5));
      }
    } catch (err) {
      console.error("Error fetching customer overview data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
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

  const customerName = user?.fullName?.split(" ")[0] || "Valued Customer";
  const activeOrder  = recentOrders.find(
    (o) => !["COMPLETED", "CANCELLED", "DELIVERED"].includes(o.orderStatus.toUpperCase())
  ) || recentOrders[0];

  const activeStageIdx = activeOrder ? getStageIndex(activeOrder.orderStatus) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white"
        style={{
          /* Deep base + mesh gradient */
          background: [
            "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
            "radial-gradient(ellipse 60% 90% at 90% 20%, color-mix(in srgb, var(--secondary) 45%, transparent) 0%, transparent 55%)",
            "radial-gradient(ellipse 50% 60% at 60% 90%, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 50%)",
            "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
          ].join(", "),
          border: "1px solid color-mix(in srgb, white 18%, transparent)",
          boxShadow: "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
        }}
      >
        {/* ── Abstract decorative layer ──────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          {/* Large soft glow — top right */}
          <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-[0.55]"
            style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />

          {/* Secondary glow — bottom left */}
          <div className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full blur-[70px] opacity-[0.45]"
            style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />

          {/* Center floating glow */}
          <div className="absolute top-1/2 left-[42%] h-44 w-44 -translate-y-1/2 rounded-full blur-[50px] opacity-[0.30]"
            style={{ background: "white" }} />

          {/* Abstract ring — large, top right */}
          <div className="absolute -top-8 -right-8 h-64 w-64 rounded-full opacity-[0.12]"
            style={{
              border: "1.5px solid color-mix(in srgb, white 90%, transparent)",
              background: "transparent",
            }} />

          {/* Abstract ring — small, center */}
          <div className="absolute top-1/2 left-[38%] h-28 w-28 -translate-y-1/2 rounded-full opacity-[0.10]"
            style={{
              border: "1px solid white",
              background: "transparent",
            }} />

          {/* Diagonal abstract lines — subtle texture */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)",
            }} />

          {/* Glass shimmer — top edge */}
          <div className="absolute inset-x-0 top-0 h-px opacity-[0.35]"
            style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                  color: "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
                }}>
                <Sparkles size={13} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
                VIP Gold Member
              </span>
              <span className="text-white/50 text-xs font-mono">
                #{stats?.customerCode || "LV-CUST-8492"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
              Hello, {customerName} 👋
            </h1>
            <p className="text-white/65 text-xs md:text-sm leading-relaxed font-medium">
              Schedule express laundry pickups in 1-tap, track real-time garment cleaning stages, and unlock loyalty rewards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard/book-services">
                <Button className="h-10 px-5 rounded-xl font-extrabold text-xs gap-2 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
                    color: "var(--primary)",
                    boxShadow: "0 4px 20px color-mix(in srgb, var(--primary) 30%, transparent)",
                  }}>
                  <Zap size={16} className="fill-current" /> Book Express Pickup
                </Button>
              </Link>
              <Link href="/dashboard/track-orders">
                <Button variant="outline"
                  className="h-10 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-2 backdrop-blur-md transition-all">
                  <Radio size={15} className="animate-pulse" style={{ color: "var(--secondary)" }} /> Track Live Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {[
              {
                label: "Wallet Credit",
                value: `৳${stats?.walletBalance?.toFixed(2) ?? "0.00"}`,
                sub: <Link href="/dashboard/wallet" className="text-[10px] font-bold mt-1 inline-block hover:underline"
                       style={{ color: "var(--secondary)" }}>+ Top Up Cash</Link>,
              },
              {
                label: "Reward Points",
                value: stats?.loyaltyPoints ?? 0,
                sub: <span className="text-[10px] font-bold mt-1 block" style={{ color: "var(--success)" }}>⭐ Gold Tier</span>,
              },
            ].map((chip) => (
              <div key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[130px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}>
                <p className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}>
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-0.5 tabular-nums">{chip.value}</p>
                {chip.sub}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Live Active Order Pipeline Stepper Widget ────────────────────── */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-card-foreground text-base">Active Order Status</h3>
                  <span className="text-xs font-mono font-extrabold" style={{ color: "var(--primary)" }}>
                    #{activeOrder.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {activeOrder.totalGarments} Garments · ৳{activeOrder.grandTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <Link href={`/dashboard/track-orders?orderId=${activeOrder.id}`}>
              <Button className="h-9 px-4 rounded-xl text-white text-xs font-extrabold gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
                style={{ background: "var(--foreground)" }}>
                View Full Live Map <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Stepper Pipeline */}
          <div className="pt-6 pb-2 px-2">
            <div className="relative flex items-center justify-between">
              <div className="absolute left-6 right-6 top-5 h-1 bg-border -z-0">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${(activeStageIdx / (PIPELINE_STAGES.length - 1)) * 100}%`,
                    background: "linear-gradient(90deg, var(--primary), var(--success))",
                  }}
                />
              </div>

              {PIPELINE_STAGES.map((stage, idx) => {
                const isPassed  = idx <= activeStageIdx;
                const isCurrent = idx === activeStageIdx;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300"
                      style={{
                        borderColor: isCurrent ? "var(--primary)" : isPassed ? "var(--success)" : "var(--border)",
                        background:  isCurrent ? "var(--primary)" : isPassed ? "var(--success)" : "var(--card)",
                        color:       isCurrent || isPassed ? "white" : "var(--muted-foreground)",
                        boxShadow:   isCurrent ? "0 4px 16px color-mix(in srgb, var(--primary) 35%, transparent)" : "none",
                        transform:   isCurrent ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      <StageIcon size={18} className={isCurrent ? "animate-spin" : ""} />
                    </div>
                    <span
                      className="mt-2 text-[11px] font-extrabold"
                      style={{
                        color: isCurrent ? "var(--primary)" : isPassed ? "var(--card-foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3. Quick Garment Category Launcher Cards ─────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-card-foreground tracking-tight">
            Book Laundry by Category
          </h2>
          <Link href="/dashboard/book-services" className="text-xs font-extrabold hover:underline flex items-center gap-1"
            style={{ color: "var(--primary)" }}>
            See All Services <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GARMENT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.name} href="/dashboard/book-services">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-lg hover:border-ring/40 transition-all"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.bg} text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                    {cat.price}
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── 4. Main Grid: Recent Orders + Wallet Launcher ───────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Recent Orders Table / Cards */}
        <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10" style={{ color: "var(--primary)" }}>
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-card-foreground">Recent Laundry Orders</h3>
                <p className="text-[11px] text-muted-foreground font-medium">Order history &amp; instant tracking</p>
              </div>
            </div>
            <Link href="/dashboard/my-orders">
              <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs font-extrabold gap-1 hover:bg-primary/10"
                style={{ color: "var(--primary)" }}>
                View All <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          <div className="p-5">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
                  <ShoppingBag size={28} style={{ color: "var(--primary)" }} />
                </div>
                <p className="text-base font-extrabold text-card-foreground">No orders yet</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  Schedule your first laundry pickup today and let our experts take care of your clothes.
                </p>
                <Link href="/dashboard/book-services">
                  <Button className="mt-4 rounded-2xl text-white text-xs font-black gap-2 shadow-lg px-6 py-2.5"
                    style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
                    <Shirt size={15} /> Book First Service
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const { cls, dot } = orderStatusStyle(order.orderStatus);
                  const paid = order.paymentStatus === "PAID";
                  return (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border p-4 hover:border-ring/40 hover:bg-muted/30 transition-all gap-3"
                    >
                      {/* Left */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-card-foreground font-mono">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                            {order.orderStatus}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold
                            ${paid ? "bg-success/10 text-success border-success/25" : "bg-error/10 text-error border-error/25"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-success" : "bg-error"}`} />
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {order.totalGarments} garments
                          </span>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <p className="text-lg font-black text-card-foreground">৳{order.grandTotal.toFixed(2)}</p>
                        <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl text-xs font-extrabold border-primary/25 hover:bg-primary hover:text-white hover:border-primary transition-all gap-1.5 shadow-sm"
                            style={{ color: "var(--primary)" }}
                          >
                            <Radio size={13} /> Live Track
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Wallet Top-Up & Shortcuts */}
        <div className="md:col-span-2 space-y-5">

          {/* Quick Wallet Top Up Card */}
          <div className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
            style={{
              background: [
                "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
                "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
              ].join(", "),
              boxShadow: "0 20px 40px -10px color-mix(in srgb, var(--primary) 45%, transparent)",
            }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--secondary))" }}>LAVO Pay Wallet</p>
                <p className="mt-1 text-3xl font-black leading-none">৳{stats?.walletBalance?.toFixed(2) ?? "0.00"}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Wallet size={22} className="text-white" />
              </div>
            </div>

            <p className="mt-3 text-xs text-white/70 font-medium leading-relaxed">
              Instant 1-tap checkout &amp; automatic cashback rewards.
            </p>

            <div className="mt-4 flex gap-2">
              {[500, 1000, 2000].map((amt) => (
                <Link key={amt} href="/dashboard/wallet" className="flex-1">
                  <Button
                    className="w-full h-9 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white font-extrabold text-[11px] backdrop-blur-md transition-all"
                  >
                    +৳{amt}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Customer Shortcuts */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Customer Operations
            </h3>
            <div className="space-y-2">
              <Link href="/dashboard/wallet"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10" style={{ color: "var(--success)" }}>
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-card-foreground">Wallet Transactions</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>
              <Link href="/dashboard/help-desk"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-warning/10" style={{ color: "var(--warning)" }}>
                    <TicketCheck size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-card-foreground">Support &amp; Help Desk</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>
              <Link href="/dashboard/wishlist"
                className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-primary/8 hover:text-primary transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-error/10" style={{ color: "var(--error)" }}>
                    <Heart size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-card-foreground">Saved Wishlist ({stats?.wishlistCount ?? 0})</span>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
