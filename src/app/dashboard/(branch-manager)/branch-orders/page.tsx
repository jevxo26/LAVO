"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Inbox, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import io from "socket.io-client";
import { motion } from "framer-motion";

import { OrderStatCards }           from "./OrderStatCards";
import { OrderToolbar, OrderTab }   from "./OrderToolbar";
import { OrderCard }                from "./OrderCard";
import { DashboardPageHero }        from "@/components/shared/DashboardPageHero";

const PROCESSING = ["CONFIRMED", "PROCESSING", "WASHING", "IRONING"];

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="space-y-4">
        {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
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

  if (loading) return <PageSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Branch Workstation & Live Dispatch"
        title="Facility Active Orders"
        description="Monitor active garment intakes, machine load, employee workflow, and partner vendor delegations."
        icon={Building2}
        liveLabel="Live Dispatch"
        chips={[
          { label: "Total",   value: stats.total      },
          { label: "Pending", value: stats.pending     },
          { label: "Ready",   value: stats.ready       },
        ]}
      />

      {/* ── 2. Overflow Alert ───────────────────────────────────────────────── */}
      {orders.length > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-warning/30 bg-warning/8 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: "var(--warning)" }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-base font-black text-warning">
                High Volume Capacity Warning — {orders.length} Active Orders
              </p>
              <p className="text-xs font-medium text-warning/80 mt-0.5">
                Branch threshold exceeded. Immediately delegate overflow garments to verified partner vendors.
              </p>
            </div>
          </div>
          <Link href="/dashboard/partner-vendors">
            <Button
              className="h-10 px-5 rounded-xl text-white text-xs font-black gap-2 shrink-0 shadow-md transition-all hover:scale-[1.02]"
              style={{ background: "var(--warning)" }}
            >
              Delegate to Vendors <ArrowRight size={14} />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* ── 3. Stat Cards ───────────────────────────────────────────────────── */}
      <OrderStatCards
        total={stats.total} pending={stats.pending}
        processing={stats.processing} ready={stats.ready}
      />

      {/* ── 4. Toolbar ──────────────────────────────────────────────────────── */}
      <OrderToolbar
        activeTab={activeTab} onTabChange={setActiveTab}
        tabCounts={tabCounts} search={search}
        onSearchChange={setSearch} totalFiltered={filtered.length}
        onRefresh={() => fetchOrders(true)} refreshing={refreshing}
      />

      {/* ── 5. Order List ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Inbox size={38} />
          </div>
          <p className="text-lg font-black text-card-foreground">No Orders Found</p>
          <p className="mt-1.5 max-w-xs text-xs text-muted-foreground font-medium">
            {search
              ? "No active orders match your search query."
              : "No active laundry orders currently in the facility."}
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
