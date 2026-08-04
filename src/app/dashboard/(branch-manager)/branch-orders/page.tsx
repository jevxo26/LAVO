"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, RefreshCw, Sparkles, Inbox, Package, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import io from "socket.io-client";
import { motion } from "framer-motion";

import { OrderStatCards }           from "./OrderStatCards";
import { OrderToolbar, OrderTab }   from "./OrderToolbar";
import { OrderCard }                from "./OrderCard";

const PROCESSING = ["CONFIRMED", "PROCESSING", "WASHING", "IRONING"];

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 ${className ?? ""}`} />;
}

export default function BranchOrders() {
  const [orders, setOrders]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]         = useState("");
  const [activeTab, setActiveTab]   = useState<OrderTab>("ALL");

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-indigo-300" />
              <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                Branch Workstation &amp; Live Dispatch
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Facility Active Orders
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Monitor active garment intakes, machine load, employee workflow, and partner vendor delegations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {[
              { label: "Total",   value: stats.total   },
              { label: "Pending", value: stats.pending  },
              { label: "Ready",   value: stats.ready    },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[85px] shadow-inner">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">{label}</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{value}</p>
              </div>
            ))}
            <Button
              onClick={() => fetchOrders(true)}
              className="h-11 px-5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-lg gap-2 transition-all hover:scale-[1.02]"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Overflow Alert ───────────────────────────────────────────────── */}
      {orders.length > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-6 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-base font-black text-amber-900 dark:text-amber-300">
                High Volume Capacity Warning — {orders.length} Active Orders
              </p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mt-0.5">
                Branch threshold exceeded. Immediately delegate overflow garments to verified partner vendors.
              </p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button className="h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black gap-2 shrink-0 shadow-md transition-all hover:scale-[1.02]">
              Delegate to Vendors <ArrowRight size={14} />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* ── 3. Stat Cards ───────────────────────────────────────────────────── */}
      {!loading && (
        <OrderStatCards
          total={stats.total} pending={stats.pending}
          processing={stats.processing} ready={stats.ready}
        />
      )}

      {/* ── 4. Toolbar ──────────────────────────────────────────────────────── */}
      {!loading && (
        <OrderToolbar
          activeTab={activeTab} onTabChange={setActiveTab}
          tabCounts={tabCounts} search={search}
          onSearchChange={setSearch} totalFiltered={filtered.length}
        />
      )}

      {/* ── 5. Order List ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">{[0, 1, 2].map((i) => <Sk key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-500 dark:bg-indigo-950/50">
            <Inbox size={38} />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">No Orders Found</p>
          <p className="mt-1.5 max-w-xs text-xs text-slate-400 font-medium">
            {search ? "No active orders match your search query." : "No active laundry orders currently in the facility."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} onUpdate={() => fetchOrders()} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
