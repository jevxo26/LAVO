"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { PackageCheck, RefreshCw, CheckCircle2, AlertTriangle, Clock, Search, RotateCcw, Layers, Zap, Store } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";

interface Batch {
  id: string; batchId: string; vendorName: string; itemType: string;
  quantity: number; stage: string; progressPercentage: number;
  estimatedCompletion: string; status: string;
}

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "IN_PROGRESS":     return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary animate-pulse", label: "In Progress"   };
    case "NEAR_COMPLETION": return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success animate-pulse", label: "Near Complete" };
    case "COMPLETED":       return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Completed"     };
    case "DELAYED":         return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Delayed"       };
    default:                return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: s || "Pending"  };
  }
}
function progressColor(pct: number) {
  if (pct >= 80) return "var(--success)";
  if (pct >= 40) return "var(--primary)";
  return "var(--warning)";
}

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />; }
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="space-y-1.5 flex-1"><Sk className="h-4 w-36" /><Sk className="h-3 w-20" /></div>
            <Sk className="h-3 w-24" /><Sk className="h-3 w-16" /><Sk className="h-5 w-24 rounded-full" />
            <div className="flex items-center gap-2"><Sk className="h-2 w-24 rounded-full" /><Sk className="h-3 w-8" /></div>
            <Sk className="h-3 w-20" /><Sk className="h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",           value: "ALL",             dotCls: "bg-muted-foreground/60"   },
  { label: "In Progress",   value: "IN_PROGRESS",     dotCls: "bg-primary animate-pulse" },
  { label: "Near Complete", value: "NEAR_COMPLETION", dotCls: "bg-success animate-pulse" },
  { label: "Completed",     value: "COMPLETED",       dotCls: "bg-success"               },
  { label: "Delayed",       value: "DELAYED",         dotCls: "bg-error animate-pulse"   },
];

export default function VendorProcessingStatusPage() {
  const [batches,    setBatches]    = useState<Batch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchBatches = useCallback(() => {
    setRefreshing(true);
    authFetch("/vendor-ops/processing-status")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setBatches(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const inProgress   = batches.filter((b) => b.status?.toUpperCase() === "IN_PROGRESS").length;
  const nearComplete = batches.filter((b) => b.status?.toUpperCase() === "NEAR_COMPLETION").length;
  const delayed      = batches.filter((b) => b.status?.toUpperCase() === "DELAYED").length;
  const avgProgress  = batches.length > 0 ? Math.round(batches.reduce((s, b) => s + (b.progressPercentage || 0), 0) / batches.length) : 0;

  const countFor = (val: string) =>
    val === "ALL" ? batches.length : batches.filter((b) => b.status?.toUpperCase() === val).length;

  const displayed = batches.filter((b) => {
    const q = search.toLowerCase();
    return (
      (!q || b.vendorName?.toLowerCase().includes(q) || b.batchId?.toLowerCase().includes(q) || b.itemType?.toLowerCase().includes(q) || b.stage?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || b.status?.toUpperCase() === activeTab)
    );
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Vendor Operations" title="Processing Status & Batches"
        description="Track outsourced garment batch stages, dry-cleaning cycles, washing progress, and completion ETAs across partner vendors."
        icon={PackageCheck}
        liveLabel={delayed > 0 ? `${delayed} Delayed` : inProgress > 0 ? `${inProgress} In Progress` : "All Idle"}
        chips={[
          { label: "Total Batches", value: loading ? "—" : String(batches.length), sub: "All vendor batches"                       },
          { label: "Avg Progress",  value: loading ? "—" : `${avgProgress}%`,      sub: "Across active batches"                    },
          { label: "Delayed",       value: loading ? "—" : String(delayed),         sub: delayed > 0 ? "Needs attention" : "None"  },
        ]}
      />

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
            <input type="text" placeholder="Search vendor, batch ID, stage…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5"><RotateCcw size={12} /> Clear</Button>}
          <Button size="sm" variant="outline" onClick={fetchBatches} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(b) => b.id}
          displayed={displayed}
          totalCount={batches.length}
          noun="batches"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No batches found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No processing data available."
          footerStats={[
            { dot: "bg-primary",  label: "In Progress",   value: inProgress,   pulse: true },
            { dot: "bg-success",  label: "Near Complete", value: nearComplete               },
            ...(delayed > 0 ? [{ dot: "bg-error", label: "Delayed", value: delayed, pulse: true }] : []),
          ]}
          columns={[
            {
              header: "Batch / Vendor", width: "minmax(160px,2fr)",
              render: (b) => {
                const isDelayed = b.status?.toUpperCase() === "DELAYED";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isDelayed ? "var(--error)" : "var(--primary)"}, ${isDelayed ? "var(--destructive)" : "var(--ring)"})` }}>
                      <Store size={15} strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{b.vendorName}</p>
                      <p className="text-[11px] font-mono font-bold text-primary/70 mt-0.5">{b.batchId}</p>
                    </div>
                  </div>
                );
              },
            },
            { header: "Item Type", width: "1fr", render: (b) => <p className="text-[12px] font-bold text-card-foreground truncate">{b.itemType}</p> },
            {
              header: "Qty", width: "80px",
              render: (b) => <p className="text-[13px] font-black text-card-foreground tabular-nums">{b.quantity} <span className="text-[10px] font-bold text-muted-foreground">pcs</span></p>,
            },
            {
              header: "Stage", width: "1fr",
              render: (b) => <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">{b.stage}</span>,
            },
            {
              header: "Progress", width: "160px",
              render: (b, idx) => {
                const pct = Math.min(b.progressPercentage ?? 0, 100);
                const barColor = progressColor(pct);
                return (
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="tabular-nums" style={{ color: barColor }}>{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.04 }}
                        className="h-full rounded-full" style={{ background: barColor }} />
                    </div>
                  </div>
                );
              },
            },
            {
              header: "ETA", width: "1fr",
              render: (b) => <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"><Clock size={11} className="shrink-0" />{b.estimatedCompletion}</div>,
            },
            {
              header: "Status", width: "130px",
              render: (b) => {
                const sm = statusMeta(b.status);
                return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}><span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}</span>;
              },
            },
          ]}
        />
      )}
    </div>
  );
}
