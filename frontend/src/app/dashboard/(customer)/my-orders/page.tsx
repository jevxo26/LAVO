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
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
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
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Tab button ───────────────────────────────────────────────────────────────

const TAB_META: Record<string, { label: string; activeClass: string; activeStyle: React.CSSProperties }> = {
  ALL:        { label: "All Orders",  activeClass: "text-white shadow-md", activeStyle: { background: "var(--primary)" } },
  PENDING:    { label: "Pending",     activeClass: "text-white shadow-md", activeStyle: { background: "var(--warning)" } },
  PROCESSING: { label: "Processing",  activeClass: "text-white shadow-md", activeStyle: { background: "var(--primary)" } },
  COMPLETED:  { label: "Completed",   activeClass: "text-white shadow-md", activeStyle: { background: "var(--success)" } },
  CANCELLED:  { label: "Cancelled",   activeClass: "text-white shadow-md", activeStyle: { background: "var(--error)"  } },
};

function tabCount(orders: OrderRecord[], tab: string): number {
  if (tab === "ALL") return orders.length;
  if (tab === "PROCESSING")
    return orders.filter((o) => PROCESSING_STATUSES.includes((o.orderStatus ?? "").toUpperCase())).length;
  return orders.filter((o) => (o.orderStatus ?? "").toUpperCase() === tab).length;
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
    active:    orders.filter((o) => PROCESSING_STATUSES.includes((o.orderStatus ?? "").toUpperCase())).length,
    completed: orders.filter((o) => (o.orderStatus ?? "").toUpperCase() === "COMPLETED").length,
    cancelled: orders.filter((o) => (o.orderStatus ?? "").toUpperCase() === "CANCELLED").length,
  }), [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = (o.orderNumber ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (activeTab === "ALL")        return true;
      if (activeTab === "PROCESSING") return PROCESSING_STATUSES.includes((o.orderStatus ?? "").toUpperCase());
      return (o.orderStatus ?? "").toUpperCase() === activeTab;
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
      <DashboardPageHero
        badge="Laundry Order Tracker & Invoices"
        title="My Orders & Receipts"
        description="Track live garment cleaning stages, download receipts, or initiate fast repeat orders."
        icon={ShoppingBag}
        chips={!loading && !error ? [
          { label: "Total Orders",  value: stats.total     },
          { label: "Active Orders", value: stats.active    },
          { label: "Completed",     value: stats.completed },
        ] : []}
      />

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      {loading ? <OrderSummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <OverviewStatCard label="Total Orders"  sub="Lifetime bookings"  value={stats.total}     icon={ShoppingBag}  gradient="from-blue-500 to-indigo-600" />
          <OverviewStatCard label="Active Orders" sub="In cleaning stage"  value={stats.active}    icon={Clock}        gradient="from-amber-400 to-orange-500" />
          <OverviewStatCard label="Completed"     sub="Delivered to door"  value={stats.completed} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" />
          <OverviewStatCard label="Cancelled"     sub="Voided requests"    value={stats.cancelled} icon={XCircle}      gradient="from-rose-500 to-pink-600" />
        </div>
      )}

      {/* ── 3. Toolbar: Status Tabs & Search Input ───────────────────────────── */}
      {!loading && !error && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
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
                      active ? meta.activeClass : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    style={active ? meta.activeStyle : undefined}
                  >
                    {meta.label}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      active ? "bg-white/25 text-white" : "bg-border text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <Link href="/dashboard/book-services" className="shrink-0">
              <Button
                size="sm"
                className="h-9 rounded-xl text-xs font-extrabold gap-1.5 text-white shadow-sm transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
              >
                <ShoppingBag size={13} /> Book New Laundry
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number..."
                className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
              />
            </div>

            {hasSearch && (
              <Button onClick={() => setSearchQuery("")} variant="ghost" className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5">
                <RotateCcw size={13} /> Clear Search
              </Button>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-black text-card-foreground">{displayed.length}</span> of{" "}
                <span className="font-black text-card-foreground">{filtered.length}</span> orders
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Order List / Empty States ─────────────────────────────────────── */}
      {loading ? (
        <OrderCardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load your orders</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Check your connection and try again.</p>
          <Button onClick={loadOrders} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-border">
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Inbox size={38} />
          </div>
          <p className="text-lg font-black text-card-foreground">No Laundry Orders Yet</p>
          <p className="mt-1.5 max-w-xs text-xs text-muted-foreground font-medium">
            Schedule an express pickup and experience premium eco-friendly garment care.
          </p>
          <Link href="/dashboard/book-services">
            <Button
              className="mt-6 h-11 px-6 rounded-2xl text-white font-black text-xs shadow-lg gap-2"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              <ShoppingBag size={16} /> Book Your First Order
            </Button>
          </Link>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Filter size={24} />
          </div>
          <p className="text-sm font-black text-card-foreground">No orders match your filters</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Try selecting a different tab or clear your search query.</p>
          <Button onClick={() => { setActiveTab("ALL"); setSearchQuery(""); }} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold gap-1.5 border-border">
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
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              {pages.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs font-bold text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className="h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5"
                    style={safePage === p ? {
                      background: "var(--primary)",
                      borderColor: "var(--primary)",
                      color: "white",
                    } : undefined}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
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
