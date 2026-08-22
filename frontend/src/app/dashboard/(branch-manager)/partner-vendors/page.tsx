"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store, Gauge, AlertTriangle, Package,
  ArrowUpRight, Search, UserCheck,
  Building2, RotateCcw, Inbox,
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
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id: string; vendorCode: string; businessName: string;
  ownerName: string; email: string; phone: string; status: string;
  dailyCapacity: number; currentOrders: number;
  availableCapacity: number; maximumCapacity: number; isFull: boolean;
  activeOrders: Array<{ id: string; orderNumber: string; totalGarments: number; grandTotal: number; createdAt: string }>;
}
interface BranchStats { branchTotalOrders: number; unassignedOrdersCount: number; overflowThreshold: number; isOverflow: boolean; }
interface UnassignedOrder { id: string; orderNumber: string; totalGarments: number; grandTotal: number; orderStatus: string; createdAt: string; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchVendorsPage() {
  const [vendors, setVendors]                   = useState<Vendor[]>([]);
  const [stats, setStats]                       = useState<BranchStats | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [search, setSearch]                     = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor]     = useState<Vendor | null>(null);
  const [selectedOrderId, setSelectedOrderId]   = useState("");
  const [assigning, setAssigning]               = useState(false);

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Branch Manager Portal"
        title="Branch Partner Vendors"
        description="Monitor live capacities and delegate order overflow to dedicated partner vendors."
        icon={Store}
        chips={[
          { label: "Active Vendors",  value: vendors.length   },
          { label: "Available Slots", value: `${totalAvailable}` },
        ]}
      />

      {/* ── 2. Overflow Alert ───────────────────────────────────────────────── */}
      {stats?.isOverflow && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border border-warning/30 bg-warning/8 px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 mt-0.5"
              style={{ color: "var(--warning)" }}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm font-black text-warning">
                High Branch Volume — {stats.branchTotalOrders} Active Orders
              </p>
              <p className="text-xs text-warning/80 mt-0.5 font-medium">
                Branch threshold of <strong>5 orders</strong> exceeded. Delegate overflow to partner vendors below.
              </p>
            </div>
          </div>
          <Badge variant="outline"
            className="border-warning/30 font-black text-xs px-3 py-1 whitespace-nowrap shrink-0"
            style={{ color: "var(--warning)", background: "color-mix(in srgb, var(--warning) 10%, transparent)" }}>
            Threshold: 5 Orders
          </Badge>
        </div>
      )}

      {/* ── 3. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewStatCard label="Partner Vendors"    sub="3 vendors per branch"  value={`${vendors.length} Active`}  icon={Building2}  gradient="from-indigo-500 to-violet-600"  />
        <OverviewStatCard label="Total Capacity"     sub="Combined daily limit"  value={`${totalCapacity}/day`}       icon={Gauge}      gradient="from-emerald-500 to-teal-600"   />
        <OverviewStatCard label="Currently Assigned" sub="Active processing"     value={`${totalAssigned} orders`}    icon={Package}    gradient="from-blue-500 to-indigo-600"    />
        <OverviewStatCard label="Available Capacity" sub="Ready for delegation"  value={`${totalAvailable} slots`}   icon={UserCheck}  gradient="from-violet-500 to-purple-600"  />
      </div>

      {/* ── 4. Search Toolbar ────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={14} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor code or name…"
              className="w-full h-10 pl-10 pr-4 rounded-2xl border border-border bg-muted/50 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>
          {search && (
            <Button size="sm" variant="ghost" onClick={() => setSearch("")}
              className="h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-error gap-1.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <p className="ml-auto text-[11px] text-muted-foreground">
            <span className="font-black text-card-foreground">{vendors.length}</span> vendors
          </p>
        </div>
      </div>

      {/* ── 5. Vendor Cards ──────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0,1,2].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Inbox size={38} />
          </div>
          <p className="text-base font-black text-card-foreground">No partner vendors found</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">No vendors are linked to this branch yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {vendors.map((vendor) => {
            const usagePct = Math.min(100, Math.round((vendor.currentOrders / vendor.dailyCapacity) * 100));
            return (
              <motion.div
                key={vendor.id}
                whileHover={{ y: -2 }}
                className="rounded-3xl border border-border bg-card shadow-sm hover:border-ring/40 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Card header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
                      style={{ color: "var(--primary)" }}>
                      <Store size={20} />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-card-foreground">{vendor.businessName}</span>
                        <span className="font-mono text-[11px] font-black rounded-lg px-2 py-0.5 bg-primary/10 border border-primary/20"
                          style={{ color: "var(--primary)" }}>
                          {vendor.vendorCode}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                          vendor.isFull
                            ? "bg-error/10 text-error border-error/25"
                            : "bg-success/10 text-success border-success/25"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${vendor.isFull ? "bg-error" : "bg-success"}`} />
                          {vendor.isFull ? "FULL" : "AVAILABLE"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="font-bold text-card-foreground">{vendor.ownerName}</span>
                        <span className="flex items-center gap-1"><Phone size={10} />{vendor.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={10} />{vendor.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <Button
                      onClick={() => handleOpenAssign(vendor)}
                      disabled={vendor.isFull || unassignedOrders.length === 0}
                      size="sm"
                      className="h-9 rounded-xl text-white font-black text-xs gap-1.5 px-4 shadow-sm disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
                    >
                      Assign Order <ArrowUpRight size={13} />
                    </Button>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="border-t border-border px-5 py-4 bg-muted/30">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-card-foreground">
                      {vendor.currentOrders} / {vendor.dailyCapacity} orders assigned
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${usagePct >= 80 ? "text-warning" : "text-muted-foreground"}`}>
                        {usagePct}% used
                      </span>
                      <span className={`font-black ${vendor.availableCapacity > 0 ? "text-success" : "text-error"}`}>
                        {vendor.availableCapacity} slots free
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={usagePct}
                    className={`h-2 rounded-full ${
                      usagePct >= 100 ? "[&>div]:bg-error"
                      : usagePct >= 75  ? "[&>div]:bg-warning"
                      : "[&>div]:bg-success"
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Assign Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border bg-card">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
              style={{ color: "var(--primary)" }}>
              <Package size={22} />
            </div>
            <DialogTitle className="text-center text-base font-black text-card-foreground">
              Assign Order to {selectedVendor?.businessName}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Select an unassigned branch order to delegate to this vendor.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4 pt-1">
              {/* Vendor info */}
              <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="font-black text-card-foreground">{selectedVendor.businessName}</p>
                  <p className="text-muted-foreground mt-0.5">Code: {selectedVendor.vendorCode}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-success">{selectedVendor.availableCapacity} slots available</p>
                  <p className="text-muted-foreground mt-0.5">Max: {selectedVendor.dailyCapacity} orders/day</p>
                </div>
              </div>

              {/* Order selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-card-foreground">
                  Select Order ({unassignedOrders.length} unassigned)
                </label>
                {unassignedOrders.length === 0 ? (
                  <div className="rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3 text-xs font-bold text-warning">
                    No unassigned orders. All orders are processed or assigned.
                  </div>
                ) : (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full h-10 px-3 border border-border rounded-2xl bg-card focus:outline-none focus:ring-1 focus:ring-ring text-xs font-bold text-card-foreground"
                  >
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="flex-1 rounded-xl h-10 font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={assigning || !selectedOrderId || unassignedOrders.length === 0}
              className="flex-1 rounded-xl h-10 text-white font-black gap-1.5"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              {assigning
                ? <><Loader2 size={14} className="animate-spin" /> Assigning…</>
                : <><Package size={14} /> Confirm</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
