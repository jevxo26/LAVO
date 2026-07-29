"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Banknote, Sparkles, CheckCircle2, Clock, XCircle, AlertCircle, ChevronLeft, ChevronRight, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Payout { id: string; amount: number; paymentMethod: string; paymentStatus: string; requestedAt: string; paidAt: string | null; }
interface Meta { total: number; page: number; limit: number; totalPages: number; }

const STATUS_FILTER = ["ALL","PENDING","APPROVED","REJECTED","PAID"];
const STATUS_STYLES: Record<string, { cls: string; dot: string }> = {
  PENDING:  { cls: "bg-amber-50  text-amber-700  border-amber-200",  dot: "bg-amber-400"   },
  APPROVED: { cls: "bg-blue-50   text-blue-700   border-blue-200",   dot: "bg-blue-500"    },
  REJECTED: { cls: "bg-rose-50   text-rose-700   border-rose-200",   dot: "bg-rose-400"    },
  PAID:     { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
};

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />; }
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-24 rounded-2xl" />)}</div>
      <div className="space-y-3">{[0,1,2,3].map((i) => <Sk key={i} className="h-16 rounded-2xl" />)}</div>
    </div>
  );
}

export default function VendorPayoutsPage() {
  const [payouts, setPayouts]     = useState<Payout[]>([]);
  const [allPayouts, setAllPayouts] = useState<Payout[]>([]);
  const [meta, setMeta]           = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage]           = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount]       = useState("");
  const [method, setMethod]       = useState("BANK_TRANSFER");

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const p    = new URLSearchParams({ page: String(page), limit: "10", status: statusFilter });
      const res  = await authFetch(`/vendor-dashboard/payouts?${p}`);
      const json = await res.json();
      if (json.success) { setPayouts(json.data ?? []); setMeta(json.meta); }
      // Also fetch all for stats (page=1 all)
      if (page === 1 && statusFilter === "ALL") setAllPayouts(json.data ?? []);
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const handleRequest = async () => {
    const res  = await authFetch("/vendor-dashboard/payouts", { method: "POST", body: JSON.stringify({ amount: parseFloat(amount), paymentMethod: method }) });
    const json = await res.json();
    if (json.success) { toast.success("Payout request submitted"); setDialogOpen(false); setAmount(""); fetchPayouts(); }
    else toast.error(json.message ?? "Failed to request payout");
  };

  if (loading) return <PageSkeleton />;

  const pending  = allPayouts.filter((p) => p.paymentStatus === "PENDING").length;
  const paid     = allPayouts.filter((p) => p.paymentStatus === "PAID").length;
  const totalPaid = allPayouts.filter((p) => p.paymentStatus === "PAID").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-emerald-200" />
              <span className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Payouts</h1>
            <p className="mt-1 text-sm text-emerald-100">Request withdrawals and track your payout history.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {pending > 0 && (
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-emerald-200 text-[10px] font-semibold uppercase tracking-wider">Pending</p>
                <p className="text-white font-extrabold text-xl leading-tight">{pending}</p>
              </div>
            )}
            <Button onClick={() => setDialogOpen(true)} className="h-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm px-4 gap-1.5 shadow-sm">
              <Plus size={14} /> Request Payout
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Requests", sub: "All time",           value: meta.total,                          Icon: Banknote,    iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100"  },
          { label: "Pending",        sub: "Awaiting approval",  value: pending,                             Icon: Clock,       iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
          { label: "Paid",           sub: "Successfully paid",  value: paid,                                Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
          { label: "Total Paid",     sub: "Amount received",    value: `৳${totalPaid.toLocaleString()}`,    Icon: Banknote,    iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
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

      {/* ── Filter ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER.map((s) => {
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-150
                  ${active ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Payout list ───────────────────────────────────────────────────── */}
      {payouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50">
            <Banknote size={38} className="text-emerald-300" />
          </div>
          <p className="text-base font-bold text-slate-800">No payouts found</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">Submit a payout request to withdraw your earnings.</p>
          <Button onClick={() => setDialogOpen(true)} className="mt-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white gap-2">
            <Plus size={14} /> Request Payout
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => {
            const sm = STATUS_STYLES[p.paymentStatus] ?? STATUS_STYLES.PENDING;
            return (
              <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 hover:border-emerald-100 hover:shadow-sm transition-all gap-3 shadow-sm">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${sm.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                      {p.paymentStatus}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">{p.paymentMethod.replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] text-slate-400">
                    <span>Requested {new Date(p.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    {p.paidAt && <span className="text-emerald-600 font-semibold">Paid {new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                  </div>
                </div>
                <p className="text-xl font-extrabold text-slate-900 shrink-0">৳{p.amount.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => setPage(pg)}
              className={`h-8 min-w-[2rem] rounded-lg border text-xs font-bold transition-all px-2
                ${page === pg ? "border-emerald-400 bg-emerald-600 text-white shadow-sm shadow-emerald-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {pg}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition">
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Request dialog ────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50"><CreditCard size={15} className="text-emerald-600" /></div>
              Request Payout
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Withdraw earnings via your preferred payment method.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Amount (৳)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                <Input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="pl-7 h-11 rounded-xl font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((amt) => (
                <button key={amt} type="button" onClick={() => setAmount(String(amt))}
                  className={`rounded-xl border py-2 text-xs font-bold transition-all
                    ${amount === String(amt) ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Payment Method</Label>
              <Select value={method} onValueChange={(v) => setMethod(v || "BANK_TRANSFER")}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_BANKING">Mobile Banking</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleRequest} disabled={!amount || parseFloat(amount) <= 0} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-1.5 font-bold">
              <Banknote size={14} /> Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
