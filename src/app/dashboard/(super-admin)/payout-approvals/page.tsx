"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/api";
import {
  Banknote, CheckCircle2, XCircle, RefreshCw,
  Lock, Search, Building2, Wallet,
  Clock, Check, X, CreditCard, RotateCcw, Loader2,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";
import { OpsTable }          from "@/components/shared/OpsTable";
import { toast }             from "sonner";
import { motion }            from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VendorPayoutItem {
  id:            string;
  vendorId?:     string;
  amount:        number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "REJECTED";
  requestedAt:   string;
  paidAt?:       string | null;
  vendor?: {
    businessName?: string;
    phone?:        string;
    city?:         string;
    user?: { fullName?: string; email?: string };
  } | null;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK: VendorPayoutItem[] = [
  { id: "pay-101", amount: 15500, paymentMethod: "BANK_TRANSFER", paymentStatus: "PENDING",  requestedAt: new Date(Date.now() - 3600000 * 3).toISOString(),  vendor: { businessName: "CleanExpress Dry Cleaners", phone: "+880 1711-998877", city: "Dhaka",      user: { fullName: "Kazi Motahar",    email: "cleanexpress@example.com" } } },
  { id: "pay-102", amount: 28400, paymentMethod: "BKASH",         paymentStatus: "PAID",     requestedAt: new Date(Date.now() - 3600000 * 24).toISOString(), paidAt: new Date(Date.now() - 3600000 * 5).toISOString(), vendor: { businessName: "EcoWash Laundry Hub",      phone: "+880 1819-334455", city: "Chittagong", user: { fullName: "Sharmin Sultana", email: "ecowash@example.com"       } } },
  { id: "pay-103", amount: 9200,  paymentMethod: "NAGAD",         paymentStatus: "REJECTED", requestedAt: new Date(Date.now() - 3600000 * 48).toISOString(), vendor: { businessName: "SpeedyPress Services",     phone: "+880 1912-445566", city: "Sylhet",     user: { fullName: "Tanvir Ahmed",    email: "speedypress@example.com"   } } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "PAID":     return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Paid"     };
    case "REJECTED": return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error",                 label: "Rejected" };
    default:         return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Pending"  };
  }
}

function fmtAmt(n: number) {
  return n >= 100000 ? `৳${(n / 100000).toFixed(2)}L` : `৳${n.toLocaleString()}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-3 w-20" />
            <div className="flex items-center gap-3 flex-1"><Sk className="h-9 w-9 rounded-xl shrink-0" /><div className="space-y-1.5"><Sk className="h-4 w-36" /><Sk className="h-3 w-24" /></div></div>
            <Sk className="h-5 w-24 rounded-lg" />
            <Sk className="h-4 w-20" />
            <Sk className="h-3 w-20" />
            <Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-8 w-32 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All Payouts", value: "ALL",      dotCls: "bg-muted-foreground/60"   },
  { label: "Pending",     value: "PENDING",  dotCls: "bg-warning animate-pulse" },
  { label: "Paid",        value: "PAID",     dotCls: "bg-success"               },
  { label: "Rejected",    value: "REJECTED", dotCls: "bg-error"                 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PayoutApprovalsPage() {
  const [payouts,       setPayouts]       = useState<VendorPayoutItem[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [activeTab,     setActiveTab]     = useState("ALL");
  const [processingId,  setProcessingId]  = useState<string | null>(null);

  const fetchPayouts = () => {
    setRefreshing(true);
    authFetch("/admin/vendors/payouts")
      .then((r) => r.json())
      .then((json) => setPayouts(json.success && json.data?.length ? json.data : FALLBACK))
      .catch(() => setPayouts(FALLBACK))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };
  useEffect(() => { fetchPayouts(); }, []);

  // ── Action ────────────────────────────────────────────────────────────────
  const handleProcess = async (payoutId: string, status: "PAID" | "REJECTED") => {
    setProcessingId(payoutId + "_" + status);
    try {
      const json = await authFetch(`/admin/vendors/payouts/${payoutId}/process`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => r.json());

      if (json.success) {
        toast.success(status === "PAID"
          ? `Payout #${payoutId.slice(-6)} approved & paid. Vendor wallet updated.`
          : `Payout #${payoutId.slice(-6)} rejected.`
        );
        setPayouts((prev) => prev.map((p) =>
          p.id === payoutId ? { ...p, paymentStatus: status, paidAt: status === "PAID" ? new Date().toISOString() : null } : p
        ));
      } else {
        toast.error(json.message || "Failed to process payout.");
      }
    } catch { toast.error("Server error while processing payout."); }
    finally { setProcessingId(null); }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const pendingCount  = payouts.filter((p) => p.paymentStatus === "PENDING").length;
  const paidCount     = payouts.filter((p) => p.paymentStatus === "PAID").length;
  const rejectedCount = payouts.filter((p) => p.paymentStatus === "REJECTED").length;
  const pendingAmt    = payouts.filter((p) => p.paymentStatus === "PENDING").reduce((s, p) => s + (p.amount || 0), 0);
  const totalSettled  = payouts.filter((p) => p.paymentStatus === "PAID").reduce((s, p) => s + (p.amount || 0), 0);

  const countFor = (val: string) =>
    val === "ALL" ? payouts.length : payouts.filter((p) => p.paymentStatus === val).length;

  // ── Filtered list ──────────────────────────────────────────────────────────
  const displayed = useMemo(() => payouts.filter((p) => {
    const q   = search.toLowerCase().trim();
    const name = (p.vendor?.businessName || p.vendor?.user?.fullName || "").toLowerCase();
    const matchSearch = !q || name.includes(q) ||
      (p.vendor?.user?.email?.toLowerCase().includes(q) ?? false) ||
      (p.vendor?.phone?.toLowerCase().includes(q) ?? false) ||
      p.id.toLowerCase().includes(q) ||
      p.paymentMethod.toLowerCase().includes(q);
    const matchTab = activeTab === "ALL" || p.paymentStatus === activeTab;
    return matchSearch && matchTab;
  }), [payouts, search, activeTab]);

  const hasFilters   = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — Financial Clearance"
        title="Vendor Payout Approvals"
        description="Super Admin clearance hub to approve partner bank settlements, bKash/Nagad transfers, and wallet payouts."
        icon={Banknote}
        liveLabel={pendingCount > 0 ? `${pendingCount} Awaiting Approval` : "All Cleared"}
        chips={[
          { label: "Pending",       value: loading ? "—" : String(pendingCount),  sub: fmtAmt(pendingAmt) + " awaiting"                    },
          { label: "Total Settled", value: loading ? "—" : fmtAmt(totalSettled),  sub: `${paidCount} payouts approved`                     },
          { label: "Rejected",      value: loading ? "—" : String(rejectedCount), sub: rejectedCount > 0 ? "Declined payouts" : "None"     },
        ]}
      />

      {/* ── 2. Stat cards ───────────────────────────────────────────────── */}
      {!loading && (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <OverviewStatCard title="Pending Requests" value={pendingCount}            icon={Clock}        gradient="from-amber-400 to-orange-500"   isPositive={pendingCount === 0} />
          <OverviewStatCard title="Approved & Paid"  value={paidCount}              icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"   />
          <OverviewStatCard title="Rejected"         value={rejectedCount}           icon={XCircle}      gradient="from-error to-rose-600"         isPositive={false} />
          <OverviewStatCard title="Total Settled"    value={fmtAmt(totalSettled)}   icon={Wallet}       gradient="from-primary to-indigo-700"     />
        </motion.div>
      )}

      {/* ── 3. Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)}
                className={["flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap select-none transition-all duration-150",
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground hover:bg-card/60"].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab.dotCls}`} />
                {tab.label}
                <span className={["rounded-full px-1.5 py-px text-[10px] font-black leading-none tabular-nums",
                  isActive ? "bg-primary/12 text-primary" : "bg-muted-foreground/10 text-muted-foreground"].join(" ")}>
                  {countFor(tab.value)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right — search + clear + refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search vendor, method, ref…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchPayouts} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* ── 4. Table ────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(p) => p.id}
          displayed={displayed}
          totalCount={payouts.length}
          noun="payouts"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No payout requests found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="All vendor accounts are clear."
          footerStats={[
            { dot: "bg-warning", label: "Pending",  value: pendingCount,  pulse: true },
            { dot: "bg-success", label: "Paid",     value: paidCount                  },
            { dot: "bg-error",   label: "Rejected", value: rejectedCount               },
          ]}
          columns={[
            {
              header: "Payout Ref", width: "110px",
              render: (p) => (
                <p className="text-[11px] font-black font-mono tabular-nums" style={{ color: "var(--success)" }}>
                  #{p.id.slice(-8).toUpperCase()}
                </p>
              ),
            },
            {
              header: "Vendor Business", width: "minmax(180px,2fr)",
              render: (p) => {
                const name = p.vendor?.businessName || p.vendor?.user?.fullName || "Vendor Partner";
                const sub  = p.vendor?.user?.email || p.vendor?.phone || "";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{name}</p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">{sub}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Method", width: "140px",
              render: (p) => (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">
                  <CreditCard size={10} className="shrink-0" />
                  {p.paymentMethod}
                </span>
              ),
            },
            {
              header: "Amount", width: "120px",
              render: (p) => (
                <p className="text-[14px] font-black tabular-nums" style={{ color: "var(--success)" }}>
                  {fmtAmt(p.amount)}
                </p>
              ),
            },
            {
              header: "Requested", width: "130px",
              render: (p) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock size={11} className="shrink-0" />
                  {new Date(p.requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              ),
            },
            {
              header: "Status", width: "120px",
              render: (p) => {
                const sm = statusMeta(p.paymentStatus);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}
                  </span>
                );
              },
            },
            {
              header: "Action", width: "180px",
              render: (p) => {
                if (p.paymentStatus !== "PENDING") {
                  return (
                    <span className="text-[11px] font-bold text-muted-foreground italic">
                      {p.paymentStatus === "PAID" ? "✓ Settled" : "✗ Declined"}
                    </span>
                  );
                }
                return (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" disabled={!!processingId}
                      onClick={() => handleProcess(p.id, "PAID")}
                      className="h-8 rounded-xl px-2.5 text-[11px] font-black gap-1 shadow-sm
                        bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:opacity-90 transition-all hover:scale-[1.02]">
                      {processingId === p.id + "_PAID" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!!processingId}
                      onClick={() => handleProcess(p.id, "REJECTED")}
                      className="h-8 rounded-xl px-2.5 text-[11px] font-black gap-1 text-muted-foreground hover:text-error hover:bg-error/10 transition-colors">
                      {processingId === p.id + "_REJECTED" ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                      Reject
                    </Button>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
