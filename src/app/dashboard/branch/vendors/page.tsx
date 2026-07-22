"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Store,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowUpRight,
  Search,
  RefreshCw,
  UserCheck,
  Building2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/api";

interface Vendor {
  id: string;
  vendorCode: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  dailyCapacity: number;
  currentOrders: number;
  availableCapacity: number;
  maximumCapacity: number;
  isFull: boolean;
  activeOrders: Array<{
    id: string;
    orderNumber: string;
    totalGarments: number;
    grandTotal: number;
    createdAt: string;
  }>;
}

interface BranchStats {
  branchTotalOrders: number;
  unassignedOrdersCount: number;
  overflowThreshold: number;
  isOverflow: boolean;
}

interface UnassignedOrder {
  id: string;
  orderNumber: string;
  totalGarments: number;
  grandTotal: number;
  orderStatus: string;
  createdAt: string;
}

export default function BranchVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<BranchStats | null>(null);
  const [unassignedOrders, setUnassignedOrders] = useState<UnassignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Assign Order Dialog State
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [assigning, setAssigning] = useState(false);

  const fetchBranchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/branch-dashboard/vendors?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setVendors(data.data.vendors);
        setStats(data.data.branchStats);
        setUnassignedOrders(data.data.unassignedOrders);
      } else {
        toast.error(data.message || "Failed to load branch vendors");
      }
    } catch {
      toast.error("Error fetching branch vendor capacity data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBranchVendors();
  }, [fetchBranchVendors]);

  const handleOpenAssignModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    if (unassignedOrders.length > 0) {
      setSelectedOrderId(unassignedOrders[0].id);
    } else {
      setSelectedOrderId("");
    }
    setAssignDialogOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedVendor || !selectedOrderId) {
      toast.error("Please select an order to assign");
      return;
    }

    setAssigning(true);
    try {
      const res = await authFetch("/branch-dashboard/vendors/assign-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrderId,
          vendorId: selectedVendor.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Order successfully assigned to vendor!");
        setAssignDialogOpen(false);
        fetchBranchVendors();
      } else {
        toast.error(data.message || "Failed to assign order");
      }
    } catch {
      toast.error("An error occurred while assigning the order.");
    } finally {
      setAssigning(false);
    }
  };

  const totalCapacity = vendors.reduce((sum, v) => sum + v.dailyCapacity, 0);
  const totalAssigned = vendors.reduce((sum, v) => sum + v.currentOrders, 0);
  const totalAvailable = vendors.reduce((sum, v) => sum + v.availableCapacity, 0);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Store className="h-7 w-7 text-indigo-600" />
            Branch Partner Vendors
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your branch&apos;s 3 dedicated partner vendors, monitor live capacities, and delegate order overflow.
          </p>
        </div>

        <Button
          onClick={fetchBranchVendors}
          variant="outline"
          className="self-start md:self-auto rounded-xl border-slate-200 hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Capacity
        </Button>
      </div>

      {/* Overflow Alert Banner (> 5 orders limit) */}
      {stats?.isOverflow && (
        <Card className="border-amber-300 bg-amber-50/80 shadow-sm animate-pulse">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-200/60 text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  High Branch Order Volume Alert ({stats.branchTotalOrders} Active Orders)
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 max-w-2xl">
                  Branch threshold limit of <strong>5 orders</strong> has been reached. Please delegate pending orders to your 3 branch partner vendors below based on their available daily capacity.
                </p>
              </div>
            </div>

            <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 font-mono text-xs px-3 py-1 font-bold whitespace-nowrap">
              Threshold Limit: 5 Orders
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Partner Vendors</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{vendors.length} Active</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">3 Vendors per Branch</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Vendor Capacity</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCapacity} Orders/Day</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Combined Daily Limit</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Gauge className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Currently Assigned</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalAssigned} Orders</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Active Processing</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Available Capacity</p>
              <h3 className="text-2xl font-bold text-indigo-600 mt-1">{totalAvailable} Slots</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Ready for Delegation</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <UserCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Vendor List & Capacity Table */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Branch Vendors & Capacity</CardTitle>
            <CardDescription className="text-xs">
              Live capacity breakdown for vendors linked to your branch.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vendor code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center">
              <RefreshCw className="h-6 w-6 text-indigo-600 animate-spin mb-2" />
              Loading branch vendor capacities...
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No partner vendors found for this branch.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Vendor Code</th>
                  <th className="p-4">Business & Owner</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 w-48">Daily Capacity Progress</th>
                  <th className="p-4 text-center">Available</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vendors.map((vendor) => {
                  const usagePercent = Math.min(
                    100,
                    Math.round((vendor.currentOrders / vendor.dailyCapacity) * 100)
                  );

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-indigo-600">
                        {vendor.vendorCode}
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{vendor.businessName}</div>
                        <div className="text-[11px] text-slate-500">Owner: {vendor.ownerName}</div>
                      </td>

                      <td className="p-4 font-medium text-slate-600">
                        <div>{vendor.phone}</div>
                        <div className="text-[11px] text-slate-400">{vendor.email}</div>
                      </td>

                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={`font-semibold text-[10px] px-2.5 py-0.5 rounded-full ${
                            vendor.isFull
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {vendor.isFull ? "FULL CAPACITY" : "AVAILABLE"}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-slate-600">
                              {vendor.currentOrders} / {vendor.dailyCapacity} Orders
                            </span>
                            <span className={usagePercent >= 80 ? "text-amber-600" : "text-slate-500"}>
                              {usagePercent}%
                            </span>
                          </div>
                          <Progress
                            value={usagePercent}
                            className={`h-2 rounded-full ${
                              usagePercent >= 100
                                ? "bg-rose-100 [&>div]:bg-rose-500"
                                : usagePercent >= 75
                                ? "bg-amber-100 [&>div]:bg-amber-500"
                                : "bg-emerald-100 [&>div]:bg-emerald-500"
                            }`}
                          />
                        </div>
                      </td>

                      <td className="p-4 text-center font-bold text-sm">
                        <span className={vendor.availableCapacity > 0 ? "text-emerald-600" : "text-rose-500"}>
                          {vendor.availableCapacity} slots
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          onClick={() => handleOpenAssignModal(vendor)}
                          disabled={vendor.isFull || unassignedOrders.length === 0}
                          size="sm"
                          className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Assign Order
                          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Assign Order Modal */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              Assign Order to {selectedVendor?.businessName}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select an unassigned branch order to delegate to this vendor.
            </DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4 py-2 text-xs">
              {/* Vendor Capacity Info */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">{selectedVendor.businessName}</div>
                  <div className="text-[11px] text-slate-500">Code: {selectedVendor.vendorCode}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{selectedVendor.availableCapacity} Slots Available</div>
                  <div className="text-[11px] text-slate-500">Limit: {selectedVendor.dailyCapacity} Orders/Day</div>
                </div>
              </div>

              {/* Order Selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select Unassigned Branch Order ({unassignedOrders.length} Available)
                </label>
                {unassignedOrders.length === 0 ? (
                  <p className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px]">
                    No unassigned orders found in your branch. All orders are currently processed or assigned.
                  </p>
                ) : (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white focus:outline-none text-xs font-semibold text-slate-800"
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

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={assigning || !selectedOrderId || unassignedOrders.length === 0}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              {assigning ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
