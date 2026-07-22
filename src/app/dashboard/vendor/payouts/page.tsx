"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface Payout {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  requestedAt: string;
  paidAt: string | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_FILTER = ["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"];
const STATUS_STYLE: Record<string, string> = {
  PENDING:  "border-amber-300 bg-amber-50 text-amber-700",
  APPROVED: "border-blue-300 bg-blue-50 text-blue-700",
  REJECTED: "border-red-300 bg-red-50 text-red-700",
  PAID:     "border-emerald-300 bg-emerald-50 text-emerald-700",
};

export default function VendorPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", status: statusFilter });
      const res = await authFetch(`/vendor-dashboard/payouts?${params}`);
      const json = await res.json();
      if (json.success) { setPayouts(json.data ?? []); setMeta(json.meta); }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleRequest = async () => {
    const res = await authFetch("/vendor-dashboard/payouts", {
      method: "POST",
      body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Payout request submitted");
      setDialogOpen(false);
      setAmount("");
      fetchPayouts();
    } else {
      toast.error(json.message ?? "Failed to request payout");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        description="Request withdrawals and view your payout history."
        actionLabel="Request Payout"
        actionIcon={Plus}
        onAction={() => setDialogOpen(true)}
      />

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTER.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <LoadingSkeleton /> : payouts.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No payouts found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold">৳{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLE[p.paymentStatus] ?? ""}>
                        {p.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(p.requestedAt).toLocaleDateString()}</TableCell>
                    <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</TableCell>
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
          <span>{meta.total} total requests</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="px-3 py-1">Page {page} of {meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Payout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Amount (৳)</Label>
              <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            <div className="space-y-1">
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRequest} disabled={!amount || parseFloat(amount) <= 0}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
