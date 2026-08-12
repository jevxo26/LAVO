"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingBag, Search, RotateCcw,
  CheckCircle2, XCircle, Clock, Package,
  ChevronLeft, ChevronRight, Store,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderRow {
  id: string; orderNumber: string; customerName: string;
  customerPhone: string; branchName: string; orderStatus: string;
  grandTotal: number; itemCount: number; createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["ALL","PENDING","PROCESSING","WASHING","IRONING","PACKAGING","COMPLETED","CANCELLED"];
const PAGE_SIZE = 10;
type TabType = "ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
const TABS: TabType[] = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
const PROCESSING_STATUSES = ["PROCESSING", "WASHING", "IRONING", "PACKAGING"];

const TAB_META: Record<string, { label: string; activeStyle: React.CSSProperties }> = {
  ALL:        { label: "All Orders",  activeStyle: { background: "var(--primary)" }  },
  PENDING:    { label: "Pending",     activeStyle: { background: "var(--warning)" }  },
  PROCESSING: { label: "Processing",  activeStyle: { background: "var(--primary)" }  },
  COMPLETED:  { label: "Completed",   activeStyle: { background: "var(--success)" }  },
  CANCELLED:  { label: "Cancelled",   activeStyle: { background: "var(--error)"   }  },
};

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING:    { cls: "bg-warning/10 text-warning border-warning/25",     dot: "bg-warning animate-pulse" },
  PROCESSING: { cls: "bg-primary/10 text-primary border-primary/25",     dot: "bg-primary animate-pulse" },
  WASHING:    { cls: "bg-primary/10 text-primary border-primary/25",     dot: "bg-primary animate-pulse" },
  IRONING:    { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary animate-pulse" },
  PACKAGING:  { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary"             },
  COMPLETED:  { cls: "bg-success/10 text-success border-success/25",     dot: "bg-success"               },
  CANCELLED:  { cls: "bg-error/10 text-error border-error/25",           dot: "bg-error"                 },
};

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground/50" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1,2,3,4].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorOrdersPage() {
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);

  const [rejectOpen, setRejectOpen]     = useState(false);
  const [rejectId, setRejectId]         = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusOpen, setStatusOpen]     = useState(false);
  const [statusId, setStatusId]         = useState<string | null>(null);
  const [newStatus, setNewStatus]       = useState("");

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch(`/vendor-dashboard/orders?page=1&limit=200`);
      const json = await res.json();
      if (json.success) setAllOrders(json.data ?? []);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [activeTab, search]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total:     allOrders.length,
    pending:   allOrders.filter((o) => o.orderStatus === "PENDING").length,
    active:    allOrders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus)).length,
    completed: allOrders.filter((o) => o.orderStatus === "COMPLETED").length,
    cancelled: allOrders.filter((o) => o.orderStatus === "CANCELLED").length,
  }), [allOrders]);

  const filtered = useMemo(() => allOrders.filter((o) => {
    const matchSearch = !search.trim()
      || o.orderNumber.toLowerCase().includes(search.toLowerCase())
      || o.customerName.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeTab === "ALL")        return true;
    if (activeTab === "PROCESSING") return PROCESSING_STATUSES.includes(o.orderStatus);
    return o.orderStatus === activeTab;
  }), [allOrders, activeTab, search]);

  const tabCount = (tab: string) => {
    if (tab === "ALL")        return allOrders.length;
    if (tab === "PROCESSING") return allOrders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus)).length;
    return allOrders.filter((o) => o.orderStatus === tab).length;
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const displayed  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleAccept = async (id: string) => {
    const res  = await authFetch(`/vendor-dashboard/orders/${id}/accept`, { method: "PATCH" });
    const json = await res.json();
    json.success ? toast.success("Order accepted") : toast.error(json.message ?? "Failed");
    if (json.success) fetchAll();
  };

  const handleRejectSubmit = async () => {
    if (!rejectId) return;
    const res  = await authFetch(`/vendor-dashboard/orders/${rejectId}/reject`, { method: "PATCH", body: JSON.stringify({ reason: rejectReason }) });
    const json = await res.json();
    if (json.success) { toast.success("Order rejected"); setRejectOpen(false); setRejectReason(""); fetchAll(); }
    else toast.error(json.message ?? "Failed");
  };

  const handleStatusUpdate = async () => {
    if (!statusId || !newStatus) return;
    const res  = await authFetch(`/vendor-dashboard/orders/${statusId}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
    const json = await res.json();
    if (json.success) { toast.success("Status updated"); setStatusOpen(false); fetchAll(); }
    else toast.error(json.message ?? "Failed");
  };

  if (loading) return <OrdersSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Partner Vendor Delegated Queue"
        title="Delegated Orders"
        description="Accept incoming laundry batches delegated from branch managers, process cleaning stages, and report progress."
        icon={Store}
        chips={!error ? [
          { label: "Total",    value: stats.total    },
          { label: "Pending",  value: stats.pending  },
          { label: "Active",   value: stats.active   },
        ] : []}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <OverviewStatCard label="Total Orders" sub="All time assigned"  value={stats.total}     icon={ShoppingBag}  gradient="from-blue-500 to-indigo-600" />
          <OverviewStatCard label="Pending"      sub="Needs acceptance"   value={stats.pending}   icon={Clock}        gradient="from-amber-400 to-orange-500" />
          <OverviewStatCard label="In Progress"  sub="Washing & ironing"  value={stats.active}    icon={Package}      gradient="from-cyan-500 to-blue-600"    />
          <OverviewStatCard label="Completed"    sub="Dispatched back"    value={stats.completed} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"  />
        </div>
      )}

      {/* ── 3. Toolbar ───────────────────────────────────────────────────────── */}
      {!error && (
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const meta   = TAB_META[tab];
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                    active ? "text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  style={active ? meta.activeStyle : undefined}
                >
                  {meta.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    active ? "bg-white/25 text-white" : "bg-border text-muted-foreground"
                  }`}>
                    {tabCount(tab)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order # or customer..."
                className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
              />
            </div>
            {search && (
              <Button onClick={() => setSearch("")} variant="ghost" className="h-9 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5">
                <RotateCcw size={13} /> Clear Search
              </Button>
            )}
            {filtered.length > 0 && (
              <p className="text-xs text-muted-foreground font-medium">
                Showing <span className="font-black text-card-foreground">{displayed.length}</span> of{" "}
                <span className="font-black text-card-foreground">{filtered.length}</span> orders
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Order List ────────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <XCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load vendor orders</p>
          <Button onClick={fetchAll} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-border">
            Retry
          </Button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <ShoppingBag size={24} />
          </div>
          <p className="text-sm font-black text-card-foreground">No orders found</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Try adjusting your search or tab filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ y: -2 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-ring/40 hover:shadow-md transition-all gap-4"
            >
              {/* Left */}
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-black text-card-foreground">#{order.orderNumber}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                  <span className="font-black text-card-foreground">{order.customerName}</span>
                  {order.customerPhone && <span>{order.customerPhone}</span>}
                  {order.branchName    && <span>· {order.branchName}</span>}
                  <span>· {order.itemCount} items</span>
                  <span>· {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <p className="text-lg font-black text-card-foreground">৳{order.grandTotal.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  {order.orderStatus === "PENDING" && (
                    <>
                      <Button
                        onClick={() => handleAccept(order.id)}
                        className="h-9 px-4 rounded-xl text-white text-xs font-black gap-1.5 shadow-sm"
                        style={{ background: "var(--success)" }}
                      >
                        <CheckCircle2 size={13} /> Accept
                      </Button>
                      <Button
                        onClick={() => { setRejectId(order.id); setRejectOpen(true); }}
                        variant="outline"
                        className="h-9 px-4 rounded-xl text-xs font-black gap-1.5 border-error/30 text-error hover:bg-error/10"
                      >
                        <XCircle size={13} /> Reject
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => { setStatusId(order.id); setNewStatus(order.orderStatus); setStatusOpen(true); }}
                    variant="outline"
                    className="h-9 px-4 rounded-xl text-xs font-black gap-1.5 border-primary/25 hover:bg-primary/10"
                    style={{ color: "var(--primary)" }}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 5. Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              className="h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5"
              style={safePage === pg ? { background: "var(--primary)", borderColor: "var(--primary)", color: "white" } : undefined}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Reject Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-black text-card-foreground">Reject Delegated Order</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground font-medium">Provide a reason for rejecting this delegated order.</p>
          <Input
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="rounded-2xl h-11 text-xs"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} className="rounded-xl h-10 font-bold">Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Status Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-black text-card-foreground">Update Processing Stage</DialogTitle>
          </DialogHeader>
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v || "")}>
            <SelectTrigger className="rounded-2xl h-11 text-xs font-bold">
              <SelectValue placeholder="Select stage" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStatusOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus}
              className="rounded-xl h-10 text-white font-bold"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
