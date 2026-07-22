"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Search, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  branchName: string;
  orderStatus: string;
  grandTotal: number;
  itemCount: number;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  "ALL", "PENDING", "PROCESSING", "WASHING",
  "IRONING", "PACKAGING", "COMPLETED", "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING:           "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING:        "bg-blue-100 text-blue-800 border-blue-200",
  WASHING:           "bg-cyan-100 text-cyan-800 border-cyan-200",
  IRONING:           "bg-purple-100 text-purple-800 border-purple-200",
  PACKAGING:         "bg-indigo-100 text-indigo-800 border-indigo-200",
  COMPLETED:         "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED:         "bg-red-100 text-red-800 border-red-200",
};

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search,
        status,
      });
      const res = await authFetch(`/vendor-dashboard/orders?${params}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data ?? []);
        setMeta(json.meta ?? { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAccept = async (orderId: string) => {
    const res = await authFetch(`/vendor-dashboard/orders/${orderId}/accept`, { method: "PATCH" });
    const json = await res.json();
    if (json.success) { toast.success("Order accepted"); fetchOrders(); }
    else toast.error(json.message ?? "Failed to accept order");
  };

  const handleRejectSubmit = async () => {
    if (!rejectOrderId) return;
    const res = await authFetch(`/vendor-dashboard/orders/${rejectOrderId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason: rejectReason }),
    });
    const json = await res.json();
    if (json.success) { toast.success("Order rejected"); setRejectDialogOpen(false); setRejectReason(""); fetchOrders(); }
    else toast.error(json.message ?? "Failed to reject order");
  };

  const handleStatusUpdate = async () => {
    if (!statusOrderId || !newStatus) return;
    const res = await authFetch(`/vendor-dashboard/orders/${statusOrderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) { toast.success("Status updated"); setStatusDialogOpen(false); fetchOrders(); }
    else toast.error(json.message ?? "Failed to update status");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Manage all orders assigned to your vendor account." />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by order number or customer…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={fetchOrders}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton />
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No orders found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-slate-400">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell>{order.branchName || "—"}</TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell>৳{order.grandTotal.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[order.orderStatus] ?? ""}>
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {order.orderStatus === "PENDING" && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => handleAccept(order.id)}>
                              <CheckCircle2 className="size-3.5 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => { setRejectOrderId(order.id); setRejectDialogOpen(true); }}>
                              <XCircle className="size-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" className="h-7"
                          onClick={() => { setStatusOrderId(order.id); setNewStatus(order.orderStatus); setStatusDialogOpen(true); }}>
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {orders.length} of {meta.total} orders</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-3 py-1 text-slate-700">Page {page} of {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Order</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">Please provide a reason for rejecting this order.</p>
          <Input
            placeholder="Reason for rejection…"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.filter((s) => s !== "ALL").map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
