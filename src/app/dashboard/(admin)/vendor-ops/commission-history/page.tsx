"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { Banknote, RefreshCw, CheckCircle2, Clock, Search, RotateCcw, TrendingUp, CircleDollarSign, Percent } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";
import { motion }            from "framer-motion";

interface Commission {
  id: string; vendorName: string; monthYear: string;
  grossOrderVolume: number | string; platformFeeRate: string;
  commissionEarned: number | string; netPayoutToVendor: number | string;
  payoutStatus: string;
}

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "PAID":    return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Paid"    };
    case "PENDING": return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Pending" };
    case "OVERDUE": return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Overdue" };
    default:        return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "—"  };
  }
}
function fmtAmt(v: number | string) {
  const n = Number(v) || 0;
  return n >= 100000 ? `৳${(n / 100000).toFixed(2)}L` : `৳${n.toLocaleString()}`;
}

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-40 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="space-y-1.5 flex-1"><Sk className="h-4 w-36" /></div>
            <Sk className="h-3 w-20" /><Sk className="h-3 w-24" /><Sk className="h-5 w-16 rounded-full" />
            <Sk className="h-3 w-20" /><Sk className="h-3 w-20" /><Sk className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",     value: "ALL",     dotCls: "bg-muted-foreground/60"   },
  { label: "Paid",    value: "PAID",    dotCls: "bg-success"               },
  { label: "Pending", value: "PENDING", dotCls: "bg-warning animate-pulse" },
  { label: "Overdue", value: "OVERDUE", dotCls: "bg-error animate-pulse"   },
];

export default function VendorCommissionHistoryPage() {
  const [comms,      setComms]      = useState<Commission[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchComms = useCallback(() => {
    setRefreshing(true);
    authFetch("/vendor-ops/commission-history")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setComms(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchComms(); }, [fetchComms]);

  const paid    = comms.filter((c) => c.payoutStatus?.toUpperCase() === "PAID").length;
  const pending = comms.filter((c) => c.payoutStatus?.toUpperCase() === "PENDING").length;
  const overdue = comms.filter((c) => c.payoutStatus?.toUpperCase() === "OVERDUE").length;
  const totalCommission = comms.reduce((s, c) => s + (Number(c.commissionEarned) || 0), 0);
  const totalPayout     = comms.reduce((s, c) => s + (Number(c.netPayoutToVendor) || 0), 0);
  const pendingPayout   = comms.filter((c) => c.payoutStatus?.toUpperCase() !== "PAID").reduce((s, c) => s + (Number(c.netPayoutToVendor) || 0), 0);

  const countFor = (val: string) =>
    val === "ALL" ? comms.length : comms.filter((c) => c.payoutStatus?.toUpperCase() === val).length;

  const displayed = comms.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q || c.vendorName?.toLowerCase().includes(q) || c.monthYear?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || c.payoutStatus?.toUpperCase() === activeTab)
    );
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Vendor Operations" title="Commission & Fee Settlement"
        description="Historical audit of marketplace platform cuts, commission percentages, and net vendor payouts across all billing cycles."
        icon={Banknote}
        liveLabel={overdue > 0 ? `${overdue} Overdue` : pending > 0 ? `${pending} Pending` : "All Settled"}
        chips={[
          { label: "Total Commission", value: loading ? "—" : fmtAmt(totalCommission), sub: "Platform earnings"                         },
          { label: "Pending Payout",   value: loading ? "—" : fmtAmt(pendingPayout),   sub: pending + overdue > 0 ? "Unsettled" : "None" },
          { label: "Overdue",          value: loading ? "—" : String(overdue),           sub: overdue > 0 ? "Needs immediate action" : "None" },
        ]}
      />

      {!loading && comms.length > 0 && (
        <motion.div initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <OverviewStatCard title="Total Gross Volume"  value={fmtAmt(comms.reduce((s,c) => s + (Number(c.grossOrderVolume)||0), 0))} icon={CircleDollarSign} gradient="from-primary to-indigo-700"     />
          <OverviewStatCard title="Total Commission"    value={fmtAmt(totalCommission)} icon={TrendingUp}     gradient="from-emerald-500 to-teal-600"  />
          <OverviewStatCard title="Total Vendor Payout" value={fmtAmt(totalPayout)}     icon={Banknote}       gradient="from-violet-500 to-purple-600" />
          <OverviewStatCard title="Pending Settlement"  value={fmtAmt(pendingPayout)}   icon={Percent}        gradient="from-amber-400 to-orange-500"  isPositive={pendingPayout === 0} />
        </motion.div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search vendor, billing cycle…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5"><RotateCcw size={12} /> Clear</Button>}
          <Button size="sm" variant="outline" onClick={fetchComms} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(c) => c.id}
          displayed={displayed}
          totalCount={comms.length}
          noun="records"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No records found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No commission history available."
          footerStats={[
            { dot: "bg-success", label: "Paid",    value: paid    },
            { dot: "bg-warning", label: "Pending", value: pending, pulse: true },
            ...(overdue > 0 ? [{ dot: "bg-error", label: "Overdue", value: overdue, pulse: true }] : []),
          ]}
          columns={[
            {
              header: "Vendor", width: "minmax(160px,2fr)",
              render: (c) => {
                const isOverdue = c.payoutStatus?.toUpperCase() === "OVERDUE";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isOverdue ? "var(--error)" : "var(--primary)"}, ${isOverdue ? "var(--destructive)" : "var(--ring)"})` }}>
                      {(c.vendorName ?? "V").charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{c.vendorName}</p>
                  </div>
                );
              },
            },
            { header: "Billing Cycle",  width: "1fr",   render: (c) => <p className="text-[12px] font-bold text-muted-foreground">{c.monthYear}</p> },
            { header: "Gross Volume",   width: "1fr",   render: (c) => <p className="text-[13px] font-black text-card-foreground tabular-nums">{fmtAmt(c.grossOrderVolume)}</p> },
            {
              header: "Rate", width: "100px",
              render: (c) => <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/8 px-2.5 py-[3px] text-[10px] font-black text-primary w-fit">{c.platformFeeRate}</span>,
            },
            { header: "Platform Cut",  width: "1fr",   render: (c) => <p className="text-[13px] font-black tabular-nums" style={{ color: "var(--success)" }}>{fmtAmt(c.commissionEarned)}</p> },
            { header: "Net Payout",    width: "1fr",   render: (c) => <p className="text-[13px] font-bold text-card-foreground tabular-nums">{fmtAmt(c.netPayoutToVendor)}</p> },
            {
              header: "Status", width: "120px",
              render: (c) => { const sm = statusMeta(c.payoutStatus); return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}><span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}</span>; },
            },
          ]}
        />
      )}
    </div>
  );
}
