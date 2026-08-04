"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingBag, Search, RotateCcw, Sparkles,
  CheckCircle2, XCircle, Clock, Package,
  ChevronLeft, ChevronRight, Store, Building2, Tag, ArrowRight
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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

interface OrderRow {
  id: string; orderNumber: string; customerName: string;
  customerPhone: string; branchName: string; orderStatus: string;
  grandTotal: number; itemCount: number; createdAt: string;
}

const STATUS_OPTIONS = ["ALL","PENDING","PROCESSING","WASHING","IRONING","PACKAGING","COMPLETED","CANCELLED"];

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING:    { cls: "bg-amber-50  text-amber-700  border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",   dot: "bg-amber-400"   },
  PROCESSING: { cls: "bg-blue-50   text-blue-700   border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",    dot: "bg-blue-500"    },
  WASHING:    { cls: "bg-cyan-50   text-cyan-700   border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300",    dot: "bg-cyan-500"    },
  IRONING:    { cls: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",  dot: "bg-violet-500"  },
  PACKAGING:  { cls: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300",  dot: "bg-indigo-500"  },
  COMPLETED:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300", dot: "bg-emerald-500" },
  CANCELLED:  { cls: "bg-rose-50   text-rose-700   border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",    dot: "bg-rose-400"    },
};

const PAGE_SIZE = 10;
type TabType = "ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
const TABS: TabType[] = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
const PROCESSING_STATUSES = ["PROCESSING", "WASHING", "IRONING", "PACKAGING"];

const TAB_META: Record<string, { label: string; active: string }> = {
  ALL:        { label: "All Orders",  active: "bg-purple-600 text-white shadow-md shadow-purple-600/30"   },
  PENDING:    { label: "Pending",     active: "bg-amber-500 text-white shadow-md shadow-amber-500/30"    },
  PROCESSING: { label: "Processing",  active: "bg-indigo-500 text-white shadow-md shadow-indigo-500/30" },
  COMPLETED:  { label: "Completed",   active: "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"},
  CANCELLED:  { label: "Cancelled",   active: "bg-rose-500 text-white shadow-md shadow-rose-500/30"      },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function VendorOrdersPage() {
  const [orders, setOrders]       = useState<OrderRow[]>([]);
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

  const fetchAll = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch(`/vendor-dashboard/orders?page=1&limit=200`);
      const json = await res.json();
      if (json.success) { setAllOrders(json.data ?? []); setOrders(json.data ?? []); }
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { setPage(1); }, [activeTab, search]);

  const stats = useMemo(() => ({
    total:     allOrders.length,
    pending:   allOrders.filter((o) => o.orderStatus === "PENDING").length,
    active:    allOrders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus)).length,
    completed: allOrders.filter((o) => o.orderStatus === "COMPLETED").length,
    cancelled: allOrders.filter((o) => o.orderStatus === "CANCELLED").length,
  }), [allOrders]);

  const filtered = useMemo(() => {
    return allOrders.filter((o) => {
      const matchSearch = !search.trim() || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === "ALL")        return true;
      if (activeTab === "PROCESSING") return PROCESSING_STATUSES.includes(o.orderStatus);
      return o.orderStatus === activeTab;
    });
  }, [allOrders, activeTab, search]);

  function tabCount(tab: string) {
    if (tab === "ALL")        return allOrders.length;
    if (tab === "PROCESSING") return allOrders.filter((o) => PROCESSING_STATUSES.includes(o.orderStatus)).length;
    return allOrders.filter((o) => o.orderStatus === tab).length;
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const displayed  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleAccept = async (id: string) => {
    const res = await authFetch(`/vendor-dashboard/orders/${id}/accept`, { method: "PATCH" });
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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-purple-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Store size={14} className="text-purple-300" />
              <span className="text-purple-200 text-xs font-black uppercase tracking-widest">
                Partner Vendor Delegated Queue
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Delegated Orders
            </h1>
            <p className="text-purple-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Accept incoming laundry batches delegated from branch managers, process cleaning stages, and report progress.
            </p>
          </div>

          {!error && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-purple-200 text-[10px] font-black uppercase tracking-wider">Total</p>
                <p className="text-white font-black text-2xl mt-0.5">{stats.total}</p>
              </div>
              {stats.pending > 0 && (
                <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                  <p className="text-purple-200 text-[10px] font-black uppercase tracking-wider">Pending</p>
                  <p className="text-white font-black text-2xl mt-0.5">{stats.pending}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Stat Cards ──────────────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders",  sub: "All time assigned",  value: stats.total,     Icon: ShoppingBag,  gradient: "from-indigo-500 to-purple-600" },
            { label: "Pending",       sub: "Needs acceptance",  value: stats.pending,   Icon: Clock,        gradient: "from-amber-400 to-orange-500" },
            { label: "In Progress",   sub: "Washing & ironing", value: stats.active,    Icon: Package,      gradient: "from-blue-500 to-cyan-600" },
            { label: "Completed",     sub: "Dispatched back",   value: stats.completed, Icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600" },
          ].map(({ label, sub, value, Icon, gradient }) => (
            <motion.div
              key={label}
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
          ))}
        </div>
      )}

      {/* ── 3. Toolbar ─────────────────────────────────────────────────────── */}
      {!error && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const meta   = TAB_META[tab];
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all duration-200 ${
                    active ? meta.active : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {meta.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  }`}>
                    {tabCount(tab)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order # or customer..."
                className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            {search && (
              <Button onClick={() => setSearch("")} variant="ghost" className="h-9 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5">
                <RotateCcw size={13} /> Clear Search
              </Button>
            )}
            {filtered.length > 0 && (
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-black text-slate-800 dark:text-slate-200">{displayed.length}</span> of{" "}
                <span className="font-black text-slate-800 dark:text-slate-200">{filtered.length}</span> orders
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Order List ──────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <XCircle size={26} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Could not load vendor orders</p>
          <Button onClick={fetchAll} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-slate-200">Retry</Button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 dark:bg-purple-950/50">
            <ShoppingBag size={24} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">No orders found</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Try adjusting your search query or tab filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ y: -2 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-purple-200 hover:shadow-md transition-all gap-4 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">#{order.orderNumber}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="font-black text-slate-800 dark:text-slate-200">{order.customerName}</span>
                  {order.customerPhone && <span>{order.customerPhone}</span>}
                  {order.branchName && <span>· {order.branchName}</span>}
                  <span>· {order.itemCount} items</span>
                  <span>· {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <p className="text-lg font-black text-slate-900 dark:text-white">৳{order.grandTotal.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  {order.orderStatus === "PENDING" && (
                    <>
                      <Button onClick={() => handleAccept(order.id)} className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black gap-1.5 shadow-md shadow-emerald-600/20">
                        <CheckCircle2 size={13} /> Accept
                      </Button>
                      <Button onClick={() => { setRejectId(order.id); setRejectOpen(true); }} variant="outline" className="h-9 px-4 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-black gap-1.5">
                        <XCircle size={13} /> Reject
                      </Button>
                    </>
                  )}
                  <Button onClick={() => { setStatusId(order.id); setNewStatus(order.orderStatus); setStatusOpen(true); }} variant="outline" className="h-9 px-4 rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50 text-xs font-black gap-1.5 dark:border-purple-800 dark:text-purple-400">
                    Update Status
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 5. Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => setPage(pg)}
              className={`h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5 ${
                safePage === pg ? "border-purple-600 bg-purple-600 text-white shadow-md shadow-purple-600/30" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              }`}>
              {pg}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-3xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader><DialogTitle className="font-black text-slate-900 dark:text-white">Reject Delegated Order</DialogTitle></DialogHeader>
          <p className="text-xs text-slate-500 font-medium">Provide a reason for rejecting this delegated order request.</p>
          <Input placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="rounded-2xl h-11 text-xs" />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} className="rounded-xl h-10 font-bold">Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="rounded-3xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader><DialogTitle className="font-black text-slate-900 dark:text-white">Update Processing Stage</DialogTitle></DialogHeader>
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v || "")}>
            <SelectTrigger className="rounded-2xl h-11 text-xs font-bold"><SelectValue placeholder="Select stage" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStatusOpen(false)} className="rounded-xl h-10">Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus} className="rounded-xl h-10 bg-purple-600 hover:bg-purple-500 font-bold">Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
