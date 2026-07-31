"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store, Gauge, AlertTriangle, Package,
  ArrowUpRight, Search, RefreshCw, UserCheck,
  Building2, Sparkles, RotateCcw, Inbox,
  Phone, Mail, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/api";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id: string; vendorCode: string; businessName: string;
  ownerName: string; email: string; phone: string; status: string;
  dailyCapacity: number; currentOrders: number;
  availableCapacity: number; maximumCapacity: number; isFull: boolean;
  activeOrders: Array<{ id: string; orderNumber: string; totalGarments: number; grandTotal: number; createdAt: string; }>;
}
interface BranchStats { branchTotalOrders: number; unassignedOrdersCount: number; overflowThreshold: number; isOverflow: boolean; }
interface UnassignedOrder { id: string; orderNumber: string; totalGarments: number; grandTotal: number; orderStatus: string; createdAt: string; }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchVendorsPage() {
  const [vendors, setVendors]                 = useState<Vendor[]>([]);
  const [stats, setStats]                     = useState<BranchStats | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor]   = useState<Vendor | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [assigning, setAssigning]             = useState(false);

  const fetchBranchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await authFetch(`/branch-dashboard/vendors?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data.vendors);
        setStats(data.data.branchStats);
        setUnassignedOrders(data.data.unassignedOrders);
      } else {
        toast.error(data.message || "Failed to load branch vendors");
      }
    } catch {
      toast.error("Error fetching vendor capacity data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchBranchVendors(); }, [fetchBranchVendors]);

  const handleOpenAssign = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedOrderId(unassignedOrders[0]?.id ?? "");
    setAssignDialogOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedVendor || !selectedOrderId) { toast.error("Please select an order"); return; }
    setAssigning(true);
    try {
      const res  = await authFetch("/branch-dashboard/vendors/assign-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, vendorId: selectedVendor.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Order assigned successfully!");
        setAssignDialogOpen(false);
        fetchBranchVendors();
      } else { toast.error(data.message || "Failed to assign order"); }
    } catch { toast.error("An error occurred"); }
    finally { setAssigning(false); }
  };

  const totalCapacity  = vendors.reduce((s, v) => s + v.dailyCapacity, 0);
  const totalAssigned  = vendors.reduce((s, v) => s + v.currentOrders, 0);
  const totalAvailable = vendors.reduce((s, v) => s + v.availableCapacity, 0);

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-violet-700 to-purple-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-violet-200" />
              <span className="text-violet-200 text-[11px] font-semibold uppercase tracking-widest">Branch Manager Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Branch Partner Vendors</h1>
            <p className="mt-1 text-sm text-violet-100">Monitor live capacities and delegate order overflow to dedicated partner vendors.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {[
              { label: "Vendors",   value: `${vendors.length} Active`  },
              { label: "Available", value: `${totalAvailable} slots`   },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-violet-200 text-[10px] font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-white font-extrabold text-xl leading-tight">{value}</p>
              </div>
            ))}
            <Button onClick={fetchBranchVendors}
              className="h-10 rounded-xl bg-white text-violet-700 hover:bg-violet-50 font-bold text-sm px-4 shadow-sm gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* ── Overflow alert ────────────────────────────────────────────────── */}
      {stats?.isOverflow && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mt-0.5">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                High Branch Volume — {stats.branchTotalOrders} Active Orders
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Branch threshold of <strong>5 orders</strong> exceeded. Delegate overflow to partner vendors below.
              </p>
            </div>
          </div>
          <Badge variant="outline"
            className="bg-amber-100 text-amber-900 border-amber-300 font-bold text-xs px-3 py-1 whitespace-nowrap shrink-0">
            Threshold: 5 Orders
          </Badge>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Partner Vendors",    sub: "3 vendors per branch",  value: `${vendors.length} Active`,   Icon: Building2, iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100",  vColor: ""                  },
          { label: "Total Capacity",     sub: "Combined daily limit",  value: `${totalCapacity}/day`,        Icon: Gauge,     iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100", vColor: ""                  },
          { label: "Currently Assigned", sub: "Active processing",     value: `${totalAssigned} orders`,     Icon: Package,   iconBg: "bg-blue-50",    iconColor: "text-blue-600",    ringColor: "ring-blue-100",    vColor: ""                  },
          { label: "Available Capacity", sub: "Ready for delegation",  value: `${totalAvailable} slots`,     Icon: UserCheck, iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100", vColor: "text-violet-600"   },
        ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor, vColor }) => (
          <div key={label}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-extrabold leading-none ${vColor || "text-slate-900"}`}>{value}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor code or name…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition" />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <p className="ml-auto text-[11px] text-slate-400">
            <span className="font-semibold text-slate-600">{vendors.length}</span> vendors
          </p>
        </div>
      </div>

      {/* ── Vendor cards ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">{[0,1,2].map((i) => <Sk key={i} className="h-28" />)}</div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-violet-50">
            <Inbox size={38} className="text-violet-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No partner vendors found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">No vendors are linked to this branch yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => {
            const usagePct = Math.min(100, Math.round((vendor.currentOrders / vendor.dailyCapacity) * 100));
            return (
              <div key={vendor.id}
                className="rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-violet-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                {/* Card header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Icon */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                      <Store size={20} className="text-violet-500" />
                    </div>
                    {/* Info */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-900">{vendor.businessName}</span>
                        <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md px-2 py-0.5">
                          {vendor.vendorCode}
                        </span>
                        <Badge variant="outline"
                          className={`text-[10px] font-bold ${vendor.isFull
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {vendor.isFull ? "FULL" : "AVAILABLE"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">{vendor.ownerName}</span>
                        <span className="flex items-center gap-1"><Phone size={10} />{vendor.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} />{vendor.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 self-start sm:self-center">
                    <Button
                      onClick={() => handleOpenAssign(vendor)}
                      disabled={vendor.isFull || unassignedOrders.length === 0}
                      size="sm"
                      className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 px-4 shadow-sm shadow-indigo-200 disabled:opacity-50">
                      Assign Order <ArrowUpRight size={13} />
                    </Button>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="border-t border-slate-50 px-5 py-4 bg-slate-50/40">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700">
                      {vendor.currentOrders} / {vendor.dailyCapacity} orders assigned
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={usagePct >= 80 ? "font-bold text-amber-600" : "text-slate-500"}>
                        {usagePct}% used
                      </span>
                      <span className={`font-bold ${vendor.availableCapacity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {vendor.availableCapacity} slots free
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={usagePct}
                    className={`h-2 rounded-full ${
                      usagePct >= 100 ? "bg-rose-100 [&>div]:bg-rose-500"
                      : usagePct >= 75 ? "bg-amber-100 [&>div]:bg-amber-500"
                      : "bg-emerald-100 [&>div]:bg-emerald-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Assign dialog ─────────────────────────────────────────────────── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
              <Package size={22} className="text-indigo-500" />
            </div>
            <DialogTitle className="text-center text-base font-extrabold text-slate-900">
              Assign Order to {selectedVendor?.businessName}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400">
              Select an unassigned branch order to delegate to this vendor.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4 pt-1">
              {/* Vendor info */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-900">{selectedVendor.businessName}</p>
                  <p className="text-slate-400 mt-0.5">Code: {selectedVendor.vendorCode}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{selectedVendor.availableCapacity} slots available</p>
                  <p className="text-slate-400 mt-0.5">Max: {selectedVendor.dailyCapacity} orders/day</p>
                </div>
              </div>

              {/* Order selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Select Order ({unassignedOrders.length} unassigned)
                </label>
                {unassignedOrders.length === 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                    No unassigned orders. All orders are processed or assigned.
                  </div>
                ) : (
                  <select value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-xs font-semibold text-slate-800">
                    {unassignedOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Order #{o.orderNumber} — {o.totalGarments} items (৳{o.grandTotal.toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="flex-1 rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={handleConfirmAssignment}
              disabled={assigning || !selectedOrderId || unassignedOrders.length === 0}
              className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1.5">
              {assigning
                ? <><Loader2 size={14} className="animate-spin" /> Assigning…</>
                : <><Package size={14} /> Confirm</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
