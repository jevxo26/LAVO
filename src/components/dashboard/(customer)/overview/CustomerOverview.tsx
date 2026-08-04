"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet, Sparkles, ShoppingBag, Heart,
  ArrowRight, Calendar, Clock, Shirt,
  CreditCard, TicketCheck, Radio,
  Package, CheckCircle2, AlertCircle, TrendingUp, ShieldCheck,
  Zap, Award, ChevronRight, PlusCircle, RefreshCw
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
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
    case "PENDING":    return { cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300", dot: "bg-amber-500 animate-pulse" };
    case "CONFIRMED":  return { cls: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",       dot: "bg-blue-500" };
    case "PROCESSING":
    case "WASHING":
    case "PICKUP":     return { cls: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300", dot: "bg-indigo-500 animate-pulse" };
    case "DELIVERY":   return { cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300", dot: "bg-purple-500 animate-pulse" };
    case "COMPLETED":  return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" };
    case "CANCELLED":  return { cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",       dot: "bg-rose-500" };
    default:           return { cls: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400" };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
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
  const { user }                      = useAuth();
  const [stats, setStats]             = useState<ProfileStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetchCustomerData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        authFetch("/customer/profile"),
        authFetch("/customer/orders"),
      ]);
      const [statsData, ordersData] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
      ]);
      if (statsData.success)  setStats(statsData.data);
      if (ordersData.success) setRecentOrders(ordersData.data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching customer overview data:", err);
      toast.error("Failed to load dashboard telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) return <DashboardSkeleton />;

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
      {/* ── 1. DRASTIC Glassmorphism Hero Header ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        {/* Background ambient glow circles */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
                <Sparkles size={13} className="text-indigo-300" /> VIP Gold Member
              </span>
              <span className="text-slate-400 text-xs font-mono">
                #{stats?.customerCode || "LV-CUST-8492"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Hello, {customerName} 👋
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
              Schedule express laundry pickups in 1-tap, track real-time garment cleaning stages, and unlock loyalty rewards.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard/book-services">
                <Button className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.02]">
                  <Zap size={16} className="fill-current" /> Book Express Pickup
                </Button>
              </Link>
              <Link href="/dashboard/track-orders">
                <Button
                  variant="outline"
                  className="h-10 px-5 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-2 backdrop-blur-md transition-all"
                >
                  <Radio size={15} className="text-indigo-300 animate-pulse" /> Track Live Order
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Hero Stats Chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[130px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Wallet Credit</p>
              <p className="text-white font-black text-2xl mt-0.5">৳{stats?.walletBalance?.toFixed(2) ?? "0.00"}</p>
              <Link href="/dashboard/wallet" className="text-[10px] text-indigo-300 hover:underline font-bold mt-1 inline-block">
                + Top Up Cash
              </Link>
            </div>

            <div className="flex-1 sm:flex-initial rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl p-4 text-center min-w-[130px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Reward Points</p>
              <p className="text-white font-black text-2xl mt-0.5">{stats?.loyaltyPoints ?? 0}</p>
              <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
                ⭐ Gold Tier
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Live Active Order Pipeline Stepper Widget ────────────────────── */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/70 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Radio size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Active Order Status</h3>
                  <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                    #{activeOrder.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {activeOrder.totalGarments} Garments · ৳{activeOrder.grandTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <Link href={`/dashboard/track-orders?orderId=${activeOrder.id}`}>
              <Button className="h-9 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold gap-1.5 shadow-sm transition-all hover:scale-[1.02]">
                View Full Live Map <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Stepper Pipeline */}
          <div className="pt-6 pb-2 px-2">
            <div className="relative flex items-center justify-between">
              {/* Pipeline connecting bar */}
              <div className="absolute left-6 right-6 top-5 h-1 bg-slate-200 dark:bg-slate-800 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-700"
                  style={{ width: `${(activeStageIdx / (PIPELINE_STAGES.length - 1)) * 100}%` }}
                />
              </div>

              {PIPELINE_STAGES.map((stage, idx) => {
                const isPassed  = idx <= activeStageIdx;
                const isCurrent = idx === activeStageIdx;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center group">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300
                        ${
                          isCurrent
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                            : isPassed
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-slate-400 dark:bg-slate-900 dark:border-slate-700"
                        }`}
                    >
                      <StageIcon size={18} className={isCurrent ? "animate-spin" : ""} />
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-extrabold ${
                        isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : isPassed
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400"
                      }`}
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
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Book Laundry by Category
          </h2>
          <Link href="/dashboard/book-services" className="text-xs font-extrabold text-indigo-600 hover:underline flex items-center gap-1">
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
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.bg} text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
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
        <div className="md:col-span-4 rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent Laundry Orders</h3>
                <p className="text-[11px] text-slate-400 font-medium">Order history &amp; instant tracking</p>
              </div>
            </div>
            <Link href="/dashboard/my-orders">
              <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 gap-1">
                View All <ArrowRight size={13} />
              </Button>
            </Link>
          </div>

          <div className="p-5">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500">
                  <ShoppingBag size={28} />
                </div>
                <p className="text-base font-extrabold text-slate-800 dark:text-white">No orders yet</p>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  Schedule your first laundry pickup today and let our experts take care of your clothes.
                </p>
                <Link href="/dashboard/book-services">
                  <Button className="mt-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black gap-2 shadow-lg shadow-indigo-600/20 px-6 py-2.5">
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all gap-3 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      {/* Left */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white font-mono">#{order.orderNumber}</span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                            {order.orderStatus}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold
                            ${paid ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-emerald-500" : "bg-rose-400"}`} />
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
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
                        <p className="text-lg font-black text-slate-900 dark:text-white">৳{order.grandTotal.toFixed(2)}</p>
                        <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-xl border-indigo-200 text-indigo-600 text-xs font-extrabold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all gap-1.5 shadow-sm"
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
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">LAVO Pay Wallet</p>
                <p className="mt-1 text-3xl font-black leading-none">৳{stats?.walletBalance?.toFixed(2) ?? "0.00"}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Wallet size={22} className="text-white" />
              </div>
            </div>

            <p className="mt-3 text-xs text-indigo-100 font-medium leading-relaxed">
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
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Customer Operations
            </h3>

            <div className="space-y-2">
              <Link
                href="/dashboard/wallet"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Wallet Transactions</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                href="/dashboard/help-desk"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    <TicketCheck size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Support &amp; Help Desk</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                href="/dashboard/wishlist"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <Heart size={16} />
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Saved Wishlist ({stats?.wishlistCount ?? 0})</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
