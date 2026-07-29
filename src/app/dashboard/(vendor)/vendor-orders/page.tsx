"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingBag, Search, RotateCcw, Sparkles,
  CheckCircle2, XCircle, Clock, Package,
  ChevronLeft, ChevronRight,
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

interface OrderRow {
  id: string; orderNumber: string; customerName: string;
  customerPhone: string; branchName: string; orderStatus: string;
  grandTotal: number; itemCount: number; createdAt: string;
}
interface Meta { total: number; page: number; limit: number; totalPages: number; }

const STATUS_OPTIONS = ["ALL","PENDING","PROCESSING","WASHING","IRONING","PACKAGING","COMPLETED","CANCELLED"];

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING:    { cls: "bg-amber-50  text-amber-700  border-amber-200",   dot: "bg-amber-400"   },
  PROCESSING: { cls: "bg-blue-50   text-blue-700   border-blue-200",    dot: "bg-blue-500"    },
  WASHING:    { cls: "bg-cyan-50   text-cyan-700   border-cyan-200",    dot: "bg-cyan-500"    },
  IRONING:    { cls: "bg-violet-50 text-violet-700 border-violet-200",  dot: "bg-violet-500"  },
  PACKAGING:  { cls: "bg-indigo-50 text-indigo-700 border-indigo-200",  dot: "bg-indigo-500"  },
  COMPLETED:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  CANCELLED:  { cls: "bg-rose-50   text-rose-700   border-rose-200",    dot: "bg-rose-400"    },
};

const PAGE_SIZE = 10;
type TabType = "ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
const TABS: TabType[] = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
const PROCESSING_STATUSES = ["PROCESSING", "WASHING", "IRONING", "PACKAGING"];

const TAB_META: Record<string, { label: string; active: string; idle: string }> = {
  ALL:        { label: "All Orders",  active: "bg-indigo-600 text-white shadow-md shadow-indigo-200",          idle: "bg-slate-100 text-slate-600 hover:bg-slate-200"                               },
  PENDING:    { label: "Pending",     active: "bg-amber-500 text-white shadow-md shadow-amber-200",           idle: "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"         },
  PROCESSING: { label: "Processing",  active: "bg-indigo-500 text-white shadow-md shadow-indigo-200",         idle: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"     },
  COMPLETED:  { label: "Completed",   active: "bg-emerald-500 text-white shadow-md shadow-emerald-200",       idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200" },
  CANCELLED:  { label: "Cancelled",   active: "bg-rose-500 text-white shadow-md shadow-rose-200",             idle: "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"             },
};

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}
function OrderSkeletons() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="space-y-3">
        {[0,1,2,3].map((i) => <Sk key={i} className="h-20 rounded-2xl" />)}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export default function VendorOrdersPage() {
  const [orders, setOrders]   = useState<OrderRow[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);

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

  if (loading) return <OrderSkeletons />;

  return (
    <div className="space-y-7">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Orders</h1>
            <p className="mt-1 text-sm text-indigo-200">Accept, update, and manage all incoming laundry orders.</p>
          </div>
          {!error && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Total</p>
                <p className="text-white font-extrabold text-xl leading-tight">{stats.total}</p>
              </div>
              {stats.pending > 0 && (
                <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                  <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Pending</p>
                  <p className="text-white font-extrabold text-xl leading-tight">{stats.pending}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders",  sub: "All time",             value: stats.total,     Icon: ShoppingBag,  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
            { label: "Pending",       sub: "Awaiting acceptance",  value: stats.pending,   Icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
            { label: "In Progress",   sub: "Currently processing", value: stats.active,    Icon: Package,      iconBg: "bg-blue-50",    iconColor: "text-blue-600",    ringColor: "ring-blue-100"    },
            { label: "Completed",     sub: "Successfully done",    value: stats.completed, Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
          ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
                <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {!error && (
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const meta   = TAB_META[tab];
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-150 ${active ? meta.active : meta.idle}`}
                >
                  {meta.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${active ? "bg-white/25 text-white" : "bg-white/70 text-current border border-current/20"}`}>
                    {tabCount(tab)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order # or customer…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
            </div>
            {search && (
              <Button size="sm" variant="ghost" onClick={() => setSearch("")}
                className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
                <RotateCcw size={12} /> Clear
              </Button>
            )}
            {filtered.length > 0 && (
              <p className="text-[11px] text-slate-400 ml-auto">
                Showing <span className="font-semibold text-slate-600">{displayed.length}</span> of{" "}
                <span className="font-semibold text-slate-600">{filtered.length}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Order list ──────────────────────────────────────────────────── */}
      {error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <XCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load orders</p>
          <Button size="sm" variant="outline" onClick={fetchAll} className="mt-4 rounded-xl text-xs font-bold">Retry</Button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <ShoppingBag size={24} className="text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No orders found</p>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((order) => (
            <div key={order.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 hover:border-indigo-100 hover:shadow-sm transition-all gap-4 shadow-sm"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-bold text-slate-900 font-mono">#{order.orderNumber}</span>
                  <StatusBadge status={order.orderStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-700">{order.customerName}</span>
                  {order.customerPhone && <span>{order.customerPhone}</span>}
                  {order.branchName && <span>· {order.branchName}</span>}
                  <span>· {order.itemCount} items</span>
                  <span>· {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <p className="text-base font-extrabold text-slate-900">৳{order.grandTotal.toLocaleString()}</p>
                <div className="flex items-center gap-1.5">
                  {order.orderStatus === "PENDING" && (
                    <>
                      <Button size="sm" onClick={() => handleAccept(order.id)}
                        className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 gap-1.5 shadow-sm shadow-emerald-200">
                        <CheckCircle2 size={12} /> Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setRejectId(order.id); setRejectOpen(true); }}
                        className="h-8 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold px-3 gap-1.5">
                        <XCircle size={12} /> Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { setStatusId(order.id); setNewStatus(order.orderStatus); setStatusOpen(true); }}
                    className="h-8 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold px-3 gap-1.5">
                    Update
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => setPage(pg)}
              className={`h-8 min-w-[2rem] rounded-lg border text-xs font-bold transition-all px-2
                ${safePage === pg ? "border-indigo-400 bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {pg}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Reject Order</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Provide a reason for rejecting this order.</p>
          <Input placeholder="Reason for rejection…" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="rounded-xl" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} className="rounded-xl">Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <Select value={newStatus} onValueChange={(v) => setNewStatus(v || "")}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select new status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus} className="rounded-xl">Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
