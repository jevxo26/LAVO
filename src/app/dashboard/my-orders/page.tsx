"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

import {
  OrderRecord,
  StatusTab,
  STATUS_TABS,
  PROCESSING_STATUSES,
  PAGE_SIZE,
  buildPages,
} from "@/components/orders/types";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderSummarySkeletons, OrderCardSkeletons } from "@/components/orders/OrderSkeletons";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  sub,
  value,
  Icon,
  iconBg,
  iconColor,
  ringColor,
}: {
  label: string;
  sub: string;
  value: string | number;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  ringColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

const TAB_META: Record<string, { label: string; color: string; activeColor: string }> = {
  ALL:        { label: "All Orders",  color: "bg-slate-100 text-slate-600 hover:bg-slate-200",                 activeColor: "bg-indigo-600 text-white shadow-md shadow-indigo-200"  },
  PENDING:    { label: "Pending",     color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",   activeColor: "bg-amber-500 text-white shadow-md shadow-amber-200"    },
  PROCESSING: { label: "Processing",  color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200", activeColor: "bg-indigo-500 text-white shadow-md shadow-indigo-200" },
  COMPLETED:  { label: "Completed",   color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200", activeColor: "bg-emerald-500 text-white shadow-md shadow-emerald-200"},
  CANCELLED:  { label: "Cancelled",   color: "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200",        activeColor: "bg-rose-500 text-white shadow-md shadow-rose-200"      },
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

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeTab, searchQuery]);

  // ── Actions ─────────────────────────────────────────────────────────────────

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

  // ── Derived state ────────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-7">

      {/* ── Hero Header ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={14} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Laundry Dashboard
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">My Orders</h1>
            <p className="mt-1 text-sm text-indigo-200">
              Track current garment laundry steps and look up past invoices.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Total Orders</p>
                <p className="text-white font-extrabold text-xl leading-tight">{stats.total}</p>
              </div>
              {stats.active > 0 && (
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Active</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{stats.active}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary Stat Cards ──────────────────────────────────────────────── */}
      {loading ? <OrderSummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Orders"  sub="All time orders placed"    value={stats.total}
            Icon={ShoppingBag}  iconBg="bg-indigo-50"  iconColor="text-indigo-600" ringColor="ring-indigo-100" />
          <StatCard label="Active Orders" sub="Currently in progress"     value={stats.active}
            Icon={Clock}        iconBg="bg-amber-50"   iconColor="text-amber-600"  ringColor="ring-amber-100"  />
          <StatCard label="Completed"     sub="Successfully delivered"    value={stats.completed}
            Icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" ringColor="ring-emerald-100"/>
          <StatCard label="Cancelled"     sub="Orders you've cancelled"   value={stats.cancelled}
            Icon={XCircle}      iconBg="bg-rose-50"    iconColor="text-rose-500"   ringColor="ring-rose-100"   />
        </div>
      )}

      {/* ── Toolbar: Tabs + Search ──────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm space-y-3">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const meta  = TAB_META[tab];
              const count = tabCount(orders, tab);
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpandedId(null); }}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-150
                    ${active ? meta.activeColor : meta.color}`}
                >
                  {meta.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold
                    ${active ? "bg-white/25 text-white" : "bg-white/70 text-current border border-current/20"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order number…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
            </div>

            {hasSearch && (
              <Button size="sm" variant="ghost" onClick={() => setSearchQuery("")}
                className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
                <RotateCcw size={12} /> Clear
              </Button>
            )}

            {!loading && filtered.length > 0 && (
              <p className="text-[11px] text-slate-400 ml-auto">
                Showing <span className="font-semibold text-slate-600">{displayed.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{filtered.length}</span> orders
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <OrderCardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load your orders</p>
          <p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p>
          <Button size="sm" variant="outline" onClick={loadOrders}
            className="mt-4 rounded-xl border-slate-200 text-xs font-bold">
            Retry
          </Button>
        </div>
      ) : orders.length === 0 ? (
        /* Completely empty account */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Inbox size={38} className="text-indigo-400" />
          </div>
          <p className="text-base font-bold text-slate-800">No orders yet</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            You haven&apos;t placed any laundry orders. Book a service to get started!
          </p>
          <Link href="/dashboard/book">
            <Button className="mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white gap-2">
              <ShoppingBag size={14} /> Book a Service
            </Button>
          </Link>
        </div>
      ) : displayed.length === 0 ? (
        /* Filtered — no results */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Filter size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No orders match your filters</p>
          <p className="mt-1 text-xs text-slate-400">Try a different tab or clear your search.</p>
          <Button size="sm" variant="outline"
            onClick={() => { setActiveTab("ALL"); setSearchQuery(""); }}
            className="mt-4 rounded-xl border-slate-200 text-xs font-bold gap-1.5">
            <RotateCcw size={12} /> Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* ── Order Cards ───────────────────────────────────────────────── */}
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

          {/* ── Pagination ────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {pages.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`h-8 min-w-[2rem] rounded-lg border text-xs font-bold transition-all px-2
                      ${safePage === p
                        ? "border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
