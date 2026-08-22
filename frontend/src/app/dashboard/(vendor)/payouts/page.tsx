"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, CheckCircle2, Clock, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Payout {
  id: string; amount: number; paymentMethod: string;
  paymentStatus: string; requestedAt: string; paidAt: string | null;
}
interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FILTER = ["ALL", "PENDING", "APPROVED", "REJECTED", "PAID"];

const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING:  { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning"   },
  APPROVED: { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary"   },
  REJECTED: { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"     },
  PAID:     { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success"   },
};

const TAB_META: Record<string, React.CSSProperties> = {
  ALL:      { background: "var(--primary)"  },
  PENDING:  { background: "var(--warning)"  },
  APPROVED: { background: "var(--primary)"  },
  REJECTED: { background: "var(--error)"    },
  PAID:     { background: "var(--success)"  },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="h-14 rounded-3xl bg-muted" />
      <div className="space-y-3">
        {[0,1,2,3].map((i) => <div key={i} className="h-20 rounded-3xl bg-muted" />)}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorPayoutsPage() {
  const [payouts, setPayouts]       = useState<Payout[]>([]);
  const [allPayouts, setAllPayouts] = useState<Payout[]>([]);
  const [meta, setMeta]             = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage]             = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount]         = useState("");
  const [method, setMethod]         = useState("BANK_TRANSFER");

  // ── Data ──────────────────────────────────────────────────────────────────

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const p    = new URLSearchParams({ page: String(page), limit: "10", status: statusFilter });
      const res  = await authFetch(`/vendor-dashboard/payouts?${p}`);
      const json = await res.json();
      if (json.success) {
        setPayouts(json.data ?? []);
        setMeta(json.meta);
        if (page === 1 && statusFilter === "ALL") setAllPayouts(json.data ?? []);
      }
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleRequest = async () => {
    const res  = await authFetch("/vendor-dashboard/payouts", {
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

  if (loading) return <PageSkeleton />;

  // ── Derived ───────────────────────────────────────────────────────────────

  const pending   = allPayouts.filter((p) => p.paymentStatus === "PENDING").length;
  const paid      = allPayouts.filter((p) => p.paymentStatus === "PAID").length;
  const totalPaid = allPayouts.filter((p) => p.paymentStatus === "PAID").reduce((s, p) => s + p.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Dashboard"
        title="Payout Requests"
        description="Request withdrawals and track your payout history."
        icon={Banknote}
        chips={[
          { label: "Total Requests", value: meta.total  },
          { label: "Pending",        value: pending      },
          { label: "Total Paid",     value: `৳${totalPaid.toLocaleString()}` },
        ]}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <OverviewStatCard label="Total Requests" sub="All time"          value={meta.total}                       icon={Banknote}    gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Pending"        sub="Awaiting approval" value={pending}                          icon={Clock}       gradient="from-amber-400 to-orange-500"  />
        <OverviewStatCard label="Paid"           sub="Successfully paid" value={paid}                             icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"  />
        <OverviewStatCard label="Total Paid"     sub="Amount received"   value={`৳${totalPaid.toLocaleString()}`} icon={Banknote}    gradient="from-violet-500 to-purple-600" />
      </div>

      {/* ── 3. Filter + Request Button ───────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`rounded-2xl px-4 py-2 text-xs font-black transition-all ${
                  active ? "text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                style={active ? TAB_META[s] : undefined}
              >
                {s}
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 px-5 rounded-2xl text-white font-black text-xs gap-1.5 shadow-sm shrink-0 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
        >
          <Plus size={14} /> Request Payout
        </Button>
      </div>

      {/* ── 4. Payout List ───────────────────────────────────────────────────── */}
      {payouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Banknote size={38} />
          </div>
          <p className="text-base font-black text-card-foreground">No payouts found</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground font-medium">
            Submit a payout request to withdraw your earnings.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-6 rounded-2xl text-white text-xs font-black gap-2"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
          >
            <Plus size={14} /> Request Payout
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const sm = STATUS_STYLES[p.paymentStatus] ?? STATUS_STYLES.PENDING;
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -2 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-border bg-card p-5 hover:border-ring/40 hover:shadow-md transition-all gap-3 shadow-sm"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${sm.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                      {p.paymentStatus}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {p.paymentMethod.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground font-medium">
                    <span>Requested {new Date(p.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {p.paidAt && (
                      <span className="text-success font-black">
                        Paid {new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xl font-black text-card-foreground shrink-0">৳{p.amount.toLocaleString()}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 5. Pagination ────────────────────────────────────────────────────── */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              className="h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5"
              style={page === pg ? {
                background: "var(--primary)",
                borderColor: "var(--primary)",
                color: "white",
              } : undefined}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── Request Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl sm:max-w-md border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-black text-card-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <CreditCard size={16} />
              </div>
              Request Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Withdraw earnings via your preferred payment method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Amount (৳)</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-base">৳</span>
                <Input
                  type="number" min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-8 h-11 rounded-2xl font-black text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="rounded-xl border py-2.5 text-xs font-black transition-all"
                  style={amount === String(amt) ? {
                    borderColor: "var(--primary)",
                    background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                    color: "var(--primary)",
                  } : {
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Payment Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v || "BANK_TRANSFER")}>
                <SelectTrigger className="rounded-2xl h-11 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-10">
              Cancel
            </Button>
            <Button
              onClick={handleRequest}
              disabled={!amount || parseFloat(amount) <= 0}
              className="rounded-xl h-10 text-white font-black gap-1.5"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
              <Banknote size={14} /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
