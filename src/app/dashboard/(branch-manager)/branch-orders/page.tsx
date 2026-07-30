"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, RefreshCw, Sparkles, Inbox, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import io from "socket.io-client";

import { OrderStatCards }           from "./OrderStatCards";
import { OrderToolbar, OrderTab }   from "./OrderToolbar";
import { OrderCard }                from "./OrderCard";

const PROCESSING = ["CONFIRMED", "PROCESSING", "WASHING", "IRONING"];

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

export default function BranchOrders() {
  const [orders, setOrders]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState("");
  const [activeTab, setActiveTab] = useState<OrderTab>("ALL");

  const fetchOrders = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    fetch("/api/branch-dashboard/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("laundrix_token")}` },
    })
      .then((r) => r.json())
      .then((r) => { setOrders(r.data || []); setLoading(false); setRefreshing(false); })
      .catch(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => {
    fetchOrders();
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
    socket.emit("joinBranch", "current_branch_id_mock");
    socket.on("garmentStatusUpdated", () => fetchOrders());
    socket.on("orderStatusUpdated",   () => fetchOrders());
    return () => { socket.disconnect(); };
  }, []);

  const stats = useMemo(() => ({
    total:      orders.length,
    pending:    orders.filter((o) => o.orderStatus === "PENDING").length,
    processing: orders.filter((o) => PROCESSING.includes(o.orderStatus)).length,
    ready:      orders.filter((o) => o.orderStatus === "READY_FOR_DELIVERY").length,
    completed:  orders.filter((o) => o.orderStatus === "COMPLETED").length,
  }), [orders]);

  const tabCounts: Record<OrderTab, number> = {
    ALL: stats.total, PENDING: stats.pending,
    PROCESSING: stats.processing, READY: stats.ready, COMPLETED: stats.completed,
  };

  const filtered = useMemo(() => orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.user?.fullName?.toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (activeTab === "ALL")        return true;
    if (activeTab === "PROCESSING") return PROCESSING.includes(o.orderStatus);
    if (activeTab === "PENDING")    return o.orderStatus === "PENDING";
    if (activeTab === "READY")      return o.orderStatus === "READY_FOR_DELIVERY";
    if (activeTab === "COMPLETED")  return o.orderStatus === "COMPLETED";
    return true;
  }), [orders, search, activeTab]);

  return (
    <div className="space-y-7">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Branch Manager Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Active Orders</h1>
            <p className="mt-1 text-sm text-indigo-200">Manage laundry orders currently in the facility.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {[
              { label: "Total",   value: stats.total   },
              { label: "Pending", value: stats.pending  },
              { label: "Ready",   value: stats.ready    },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
              </div>
            ))}
            <Button onClick={() => fetchOrders(true)}
              className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm px-4 shadow-sm gap-1.5">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Overflow alert */}
      {orders.length > 5 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">High Order Volume — {orders.length} Active Orders</p>
              <p className="text-xs text-amber-700 mt-0.5">Branch threshold of 5 exceeded. Delegate overflow to partner vendors.</p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button size="sm" className="h-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold gap-1.5 shrink-0">
              View Partner Vendors <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      {!loading && (
        <OrderStatCards
          total={stats.total} pending={stats.pending}
          processing={stats.processing} ready={stats.ready}
        />
      )}

      {/* Toolbar */}
      {!loading && (
        <OrderToolbar
          activeTab={activeTab} onTabChange={setActiveTab}
          tabCounts={tabCounts} search={search}
          onSearchChange={setSearch} totalFiltered={filtered.length}
        />
      )}

      {/* Order list */}
      {loading ? (
        <div className="space-y-3">{[0,1,2,3].map((i) => <Sk key={i} className="h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Inbox size={38} className="text-indigo-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No orders found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            {search ? "Try a different search term." : "No active orders in the facility right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={() => fetchOrders()} />
          ))}
        </div>
      )}
    </div>
  );
}
