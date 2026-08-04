"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingBag,
  Search,
  RotateCcw,
  Filter,
  AlertCircle,
  Inbox,
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

import {
  OrderRecord,
  StatusTab,
  STATUS_TABS,
  PROCESSING_STATUSES,
  PAGE_SIZE,
  buildPages,
} from "@/components/dashboard/(customer)/orders/types";
import { OrderCard } from "@/components/dashboard/(customer)/orders/OrderCard";
import { OrderSummarySkeletons, OrderCardSkeletons } from "@/components/dashboard/(customer)/orders/OrderSkeletons";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  sub,
  value,
  Icon,
  gradient,
}: {
  label: string;
  sub: string;
  value: string | number;
  Icon: React.ElementType;
  gradient: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${gradient} absolute top-0 left-0 right-0`} />
      <div className="flex items-center gap-4 pt-1">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value}</p>
          <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">{label}</p>
          <p className="text-[11px] font-medium text-slate-400 leading-tight">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

const TAB_META: Record<string, { label: string; activeColor: string }> = {
  ALL:        { label: "All Orders",  activeColor: "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"  },
  PENDING:    { label: "Pending",     activeColor: "bg-amber-500 text-white shadow-md shadow-amber-500/30"    },
  PROCESSING: { label: "Processing",  activeColor: "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" },
  COMPLETED:  { label: "Completed",   activeColor: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"},
  CANCELLED:  { label: "Cancelled",   activeColor: "bg-rose-500 text-white shadow-md shadow-rose-500/30"      },
};

function tabCount(orders: OrderRecord[], tab: string): number {
  if (tab === "ALL") return orders.length;
  if (tab === "PROCESSING")
    return orders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus.toUpperCase())).length;
  return orders.filter((o) => o.orderStatus.toUpperCase() === tab).length;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const [orders, setOrders]           = useState<OrderRecord[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [activeTab, setActiveTab]     = useState<StatusTab>("ALL");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [page, setPage]               = useState(1);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadOrders = async () => {
    setError(false);
    try {
      const res  = await authFetch("/customer/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
      else setError(true);
    } catch (err) {
      console.error("Error loading orders:", err);
      setError(true);
      toast.error("Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await authFetch("/payments/verify-order-payment", {
          method: "POST",
          body: JSON.stringify({}),
        });
      } catch {}
      await loadOrders();
    };
    init();
  }, []);

  useEffect(() => { setPage(1); }, [activeTab, searchQuery]);

  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const socketUrl =
      typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_API_URL?.startsWith("http")
          ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "")
          : window.location.origin
        : "";

    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem("laundrix_token") },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinCustomer", user.id);
    });

    socket.on("orderStatusUpdated", () => {
      loadOrders();
    });

    return () => { socket.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleCancelOrder = async (order: OrderRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.orderNumber}? This cannot be undone.`
    );
    if (!confirmed) return;

    setCancellingId(order.id);
    try {
      const res  = await authFetch(`/customer/orders/${order.id}/cancel`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled successfully");
        loadOrders();
      } else {
        toast.error(data.message || "Failed to cancel order");
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayNow = async (order: OrderRecord) => {
    try {
      toast.info("Initializing payment gateway...");
      const res  = await authFetch("/payments/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success && data.data?.gatewayUrl) {
        window.location.href = data.data.gatewayUrl;
      } else {
        toast.error("Payment failed to initialize");
      }
    } catch {
      toast.error("Failed to start payment process");
    }
  };

  const stats = useMemo(() => ({
    total:     orders.length,
    active:    orders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus.toUpperCase())).length,
    completed: orders.filter((o) => o.orderStatus.toUpperCase() === "COMPLETED").length,
    cancelled: orders.filter((o) => o.orderStatus.toUpperCase() === "CANCELLED").length,
  }), [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === "ALL")        return true;
      if (activeTab === "PROCESSING") return PROCESSING_STATUSES.includes(o.orderStatus.toUpperCase());
      return o.orderStatus.toUpperCase() === activeTab;
    });
  }, [orders, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const displayed  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pages      = buildPages(safePage, totalPages);

  const hasSearch = searchQuery.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-300" />
              <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                Laundry Order Tracker &amp; Invoices
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              My Orders &amp; Receipts
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Track live garment cleaning stages, download receipts, or initiate fast repeat orders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard/book-services">
              <Button className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.02]">
                <ShoppingBag size={16} /> Book New Laundry
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      {loading ? <OrderSummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Orders"  sub="Lifetime bookings"  value={stats.total}     Icon={ShoppingBag}  gradient="from-indigo-500 to-violet-600" />
          <StatCard label="Active Orders" sub="In cleaning stage"  value={stats.active}    Icon={Clock}        gradient="from-amber-400 to-orange-500" />
          <StatCard label="Completed"     sub="Delivered to door"  value={stats.completed} Icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" />
          <StatCard label="Cancelled"     sub="Voided requests"    value={stats.cancelled} Icon={XCircle}      gradient="from-rose-500 to-pink-600" />
        </div>
      )}

      {/* ── 3. Toolbar: Status Tabs & Search Input ───────────────────────────── */}
      {!loading && !error && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const meta  = TAB_META[tab];
              const count = tabCount(orders, tab);
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                    active
                      ? meta.activeColor
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {meta.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number..."
                className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            {hasSearch && (
              <Button onClick={() => setSearchQuery("")} variant="ghost" className="h-9 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5">
                <RotateCcw size={13} /> Clear Search
              </Button>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-black text-slate-800 dark:text-slate-200">{displayed.length}</span> of{" "}
                <span className="font-black text-slate-800 dark:text-slate-200">{filtered.length}</span> orders
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Order List / Empty States ─────────────────────────────────────── */}
      {loading ? (
        <OrderCardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Could not load your orders</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Check your connection and try again.</p>
          <Button onClick={loadOrders} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-slate-200">
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
            <Inbox size={38} />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">No Laundry Orders Yet</p>
          <p className="mt-1.5 max-w-xs text-xs text-slate-400 font-medium">
            Schedule an express pickup and experience premium eco-friendly garment care.
          </p>
          <Link href="/dashboard/book-services">
            <Button className="mt-6 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 gap-2">
              <ShoppingBag size={16} /> Book Your First Order
            </Button>
          </Link>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Filter size={24} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">No orders match your filters</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Try selecting a different tab or clear your search query.</p>
          <Button onClick={() => { setActiveTab("ALL"); setSearchQuery(""); }} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold gap-1.5 border-slate-200">
            <RotateCcw size={13} /> Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayed.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onPayNow={handlePayNow}
                onCancel={handleCancelOrder}
                cancellingId={cancellingId}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>

              {pages.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs font-bold text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5 ${
                      safePage === p
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
