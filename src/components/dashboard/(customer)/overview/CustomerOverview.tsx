"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet, Sparkles, ShoppingBag, Heart,
  ArrowRight, Calendar, Clock, Shirt,
  CreditCard, TicketCheck, Radio,
  Package, CheckCircle2, AlertCircle, TrendingUp, ShieldCheck
} from "lucide-react";
import { authFetch } from "@/lib/api";
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function orderStatusStyle(status: string): { cls: string; dot: string } {
  switch (status.toUpperCase()) {
    case "PENDING":    return { cls: "bg-amber-50 text-amber-700 border-amber-200",    dot: "bg-amber-400"   };
    case "CONFIRMED":  return { cls: "bg-blue-50 text-blue-700 border-blue-200",       dot: "bg-blue-500"    };
    case "PROCESSING":
    case "WASHING":
    case "PICKUP":     return { cls: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500"  };
    case "DELIVERY":   return { cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500"  };
    case "COMPLETED":  return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" };
    case "CANCELLED":  return { cls: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-400"    };
    default:           return { cls: "bg-slate-50 text-slate-600 border-slate-200",    dot: "bg-slate-400"   };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-28" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-80" />
        <Sk className="md:col-span-2 h-80" />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, href, linkLabel,
  Icon, iconBg, iconColor, ringColor,
}: {
  label: string; value: string; sub: string;
  href: string; linkLabel: string;
  Icon: React.ElementType;
  iconBg: string; iconColor: string; ringColor: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
          <Icon size={20} />
        </div>
        <Link
          href={href}
          className={`flex items-center gap-1 text-[11px] font-extrabold ${iconColor} hover:underline`}
        >
          {linkLabel} <ArrowRight size={11} />
        </Link>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="mt-1 text-[12px] font-bold text-slate-700 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
      </div>
    </div>
  );
}

// ─── Quick action link ────────────────────────────────────────────────────────

function QuickAction({
  href, Icon, iconBg, iconColor, title, sub,
}: {
  href: string;
  Icon: React.ElementType;
  iconBg: string; iconColor: string;
  title: string; sub: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-white p-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 hover:shadow-sm transition-all group"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} group-hover:scale-105 transition-transform`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight">{title}</p>
        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{sub}</p>
      </div>
      <ArrowRight size={14} className="ml-auto shrink-0 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── CustomerOverview ─────────────────────────────────────────────────────────

export function CustomerOverview() {
  const [stats, setStats]             = useState<ProfileStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function fetchData() {
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
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-7 py-9 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-15">
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white blur-2xl" />
          <div className="absolute -bottom-12 -left-10 h-52 w-52 rounded-full bg-white blur-xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">
                Customer ID: #{stats?.customerCode || "LV-CUST"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Fresh Laundry, Delivered to Your Door
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed">
              Book express laundry pickups, track active processing in real-time, and manage your wallet seamlessly.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/dashboard/book-services">
                <Button className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-5 shadow-md gap-2">
                  <Shirt size={15} /> Book a Service
                </Button>
              </Link>
              <Link href="/dashboard/track-orders">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 font-bold text-xs px-5 gap-2 backdrop-blur-md"
                >
                  <Radio size={14} /> Track Orders
                </Button>
              </Link>
            </div>
          </div>

          {/* Live stats chips */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Wallet Balance</p>
              <p className="text-white font-extrabold text-xl leading-tight">৳{stats?.walletBalance?.toFixed(2) ?? "0.00"}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Active Orders</p>
              <p className="text-white font-extrabold text-xl leading-tight">{stats?.activeOrdersCount ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Reward Points</p>
              <p className="text-white font-extrabold text-xl leading-tight">{stats?.loyaltyPoints ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Wallet Balance"   value={`৳${stats?.walletBalance?.toFixed(2) ?? "0.00"}`}
          sub="Available credits"  href="/dashboard/wallet"     linkLabel="Top Up"
          Icon={Wallet}            iconBg="bg-indigo-50"        iconColor="text-indigo-600"  ringColor="ring-indigo-100"
        />
        <StatCard
          label="Loyalty Points"   value={`${stats?.loyaltyPoints ?? 0} PTS`}
          sub="Earn with every order" href="/dashboard/wallet"  linkLabel="View History"
          Icon={Sparkles}          iconBg="bg-violet-50"        iconColor="text-violet-600"  ringColor="ring-violet-100"
        />
        <StatCard
          label="Active Orders"    value={String(stats?.activeOrdersCount ?? 0)}
          sub="In processing cycle" href="/dashboard/my-orders" linkLabel="View Orders"
          Icon={ShoppingBag}       iconBg="bg-amber-50"         iconColor="text-amber-600"   ringColor="ring-amber-100"
        />
        <StatCard
          label="Wishlist Items"   value={String(stats?.wishlistCount ?? 0)}
          sub="Saved services"     href="/dashboard/wishlist"   linkLabel="View Wishlist"
          Icon={Heart}             iconBg="bg-rose-50"          iconColor="text-rose-500"    ringColor="ring-rose-100"
        />
      </div>

      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Recent Orders */}
        <div className="md:col-span-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Package size={15} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Recent Orders</h2>
                <p className="text-[11px] text-slate-400">Your latest laundry requests &amp; live status</p>
              </div>
            </div>
            <Link href="/dashboard/my-orders">
              <Button variant="ghost" size="sm"
                className="h-8 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 gap-1">
                View All <ArrowRight size={12} />
              </Button>
            </Link>
          </div>

          <div className="p-5">
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                  <ShoppingBag size={24} className="text-indigo-400" />
                </div>
                <p className="text-sm font-bold text-slate-800">No orders yet</p>
                <p className="mt-1 text-xs text-slate-400 max-w-xs">
                  Schedule your first laundry pickup and let us handle your garments.
                </p>
                <Link href="/dashboard/book-services">
                  <Button className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm">
                    <Shirt size={14} /> Book Service Now
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all gap-3"
                    >
                      {/* Left */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 font-mono">#{order.orderNumber}</span>
                          {/* Order status badge */}
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                            {order.orderStatus}
                          </span>
                          {/* Payment badge */}
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold
                            ${paid ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${paid ? "bg-emerald-500" : "bg-rose-400"}`} />
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {order.totalGarments} garments
                          </span>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <p className="text-base font-extrabold text-slate-900">৳{order.grandTotal.toFixed(2)}</p>
                        <Link href={`/dashboard/track-orders?orderId=${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-xl border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors gap-1.5 shadow-sm"
                          >
                            <Radio size={12} /> Track Live
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

        {/* Quick Actions */}
        <div className="md:col-span-2 space-y-5">

          {/* Quick action links */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <Sparkles size={14} className="text-indigo-600" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-900">Quick Shortcuts</h2>
            </div>
            <div className="p-4 space-y-2.5">
              <QuickAction
                href="/dashboard/book-services"
                Icon={Shirt}
                iconBg="bg-indigo-50" iconColor="text-indigo-600"
                title="Book a Service"
                sub="Select garments & schedule pickup"
              />
              <QuickAction
                href="/dashboard/wallet"
                Icon={CreditCard}
                iconBg="bg-emerald-50" iconColor="text-emerald-600"
                title="Top Up Wallet"
                sub="Quick online credit deposit"
              />
              <QuickAction
                href="/dashboard/help-desk"
                Icon={TicketCheck}
                iconBg="bg-amber-50" iconColor="text-amber-600"
                title="Support Ticket"
                sub="Ask the support team"
              />
              <QuickAction
                href="/dashboard/my-orders"
                Icon={CheckCircle2}
                iconBg="bg-violet-50" iconColor="text-violet-600"
                title="My Orders"
                sub="View all orders & invoices"
              />
            </div>
          </div>

          {/* Loyalty info card */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-violet-200">Loyalty Rewards</p>
                <p className="mt-1 text-2xl font-extrabold leading-none">{stats?.loyaltyPoints ?? 0} PTS</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
                <Sparkles size={18} className="text-violet-200" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-violet-100 leading-relaxed">
              Earn 1 point for every ৳100 spent. Redeem points on your next booking!
            </p>
            <div className="mt-3 h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-2 rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min(100, ((stats?.loyaltyPoints ?? 0) % 100))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-violet-200 text-right font-extrabold">
              {100 - ((stats?.loyaltyPoints ?? 0) % 100)} pts to next reward
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
