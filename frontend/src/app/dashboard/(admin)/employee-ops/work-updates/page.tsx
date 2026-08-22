"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { FileCheck, RefreshCw, CheckCircle2, AlertTriangle, Clock, Search, RotateCcw, Shirt, ShieldCheck } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";

interface WorkUpdate {
  id: string; employeeName: string; branchName: string;
  shift: string; garmentsScanned: number; qualityPasses: number;
  reworkRequired: number; status: string;
}

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "ACTIVE":      return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success animate-pulse", label: "Active"     };
    case "ON_BREAK":
    case "BREAK":       return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning",               label: "On Break"   };
    case "COMPLETED":
    case "SHIFT_END":   return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary",               label: "Shift Done" };
    case "FLAGGED":     return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Flagged"    };
    default:            return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "—"     };
  }
}
function passRateColor(rate: number) {
  if (rate >= 90) return "var(--success)";
  if (rate >= 70) return "var(--warning)";
  return "var(--error)";
}
function getPassRate(u: WorkUpdate) {
  return u.garmentsScanned > 0 ? Math.round((u.qualityPasses / u.garmentsScanned) * 100) : 0;
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
            <div className="flex items-center gap-3 flex-1"><Sk className="h-9 w-9 rounded-xl shrink-0" /><Sk className="h-4 w-32" /></div>
            <Sk className="h-3 w-24" /><Sk className="h-3 w-20" /><Sk className="h-3 w-16" />
            <Sk className="h-8 w-24 rounded-xl" /><Sk className="h-3 w-12" /><Sk className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",        value: "ALL",       dotCls: "bg-muted-foreground/60"   },
  { label: "Active",     value: "ACTIVE",    dotCls: "bg-success animate-pulse" },
  { label: "On Break",   value: "ON_BREAK",  dotCls: "bg-warning"               },
  { label: "Shift Done", value: "COMPLETED", dotCls: "bg-primary"               },
  { label: "Flagged",    value: "FLAGGED",   dotCls: "bg-error animate-pulse"   },
];

export default function EmployeeWorkUpdatesPage() {
  const [updates,    setUpdates]    = useState<WorkUpdate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchUpdates = useCallback(() => {
    setRefreshing(true);
    authFetch("/employee-ops/work-updates")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setUpdates(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const activeCount  = updates.filter((u) => u.status?.toUpperCase() === "ACTIVE").length;
  const flaggedCount = updates.filter((u) => u.status?.toUpperCase() === "FLAGGED").length;
  const totalScanned = updates.reduce((s, u) => s + (u.garmentsScanned || 0), 0);
  const totalRework  = updates.reduce((s, u) => s + (u.reworkRequired  || 0), 0);
  const totalPasses  = updates.reduce((s, u) => s + (u.qualityPasses   || 0), 0);
  const avgPassRate  = totalScanned > 0 ? Math.round((totalPasses / totalScanned) * 100) : 0;

  const countFor = (val: string) =>
    val === "ALL" ? updates.length
    : val === "COMPLETED" ? updates.filter((u) => ["COMPLETED","SHIFT_END"].includes(u.status?.toUpperCase())).length
    : val === "ON_BREAK"  ? updates.filter((u) => ["ON_BREAK","BREAK"].includes(u.status?.toUpperCase())).length
    : updates.filter((u) => u.status?.toUpperCase() === val).length;

  const displayed = updates.filter((u) => {
    const q = search.toLowerCase();
    const matchTab = activeTab === "ALL" ? true
      : activeTab === "COMPLETED" ? ["COMPLETED","SHIFT_END"].includes(u.status?.toUpperCase())
      : activeTab === "ON_BREAK"  ? ["ON_BREAK","BREAK"].includes(u.status?.toUpperCase())
      : u.status?.toUpperCase() === activeTab;
    return (!q || u.employeeName?.toLowerCase().includes(q) || u.branchName?.toLowerCase().includes(q) || u.shift?.toLowerCase().includes(q)) && matchTab;
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Employee Operations" title="Shift & Work Updates"
        description="Real-time garment scanning telemetry, quality pass rates, rework counts, and shift status logs across all branch employees."
        icon={FileCheck}
        liveLabel={flaggedCount > 0 ? `${flaggedCount} Flagged` : activeCount > 0 ? `${activeCount} On Shift` : "No Active Shifts"}
        chips={[
          { label: "On Shift",      value: loading ? "—" : String(activeCount), sub: "Active employees" },
          { label: "Avg Pass Rate", value: loading ? "—" : `${avgPassRate}%`,   sub: avgPassRate >= 90 ? "Excellent" : avgPassRate >= 70 ? "Acceptable" : "Needs attention" },
          { label: "Total Rework",  value: loading ? "—" : String(totalRework), sub: totalRework > 0 ? "Items flagged" : "None" },
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
            <input type="text" placeholder="Search employee, branch, shift…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5"><RotateCcw size={12} /> Clear</Button>}
          <Button size="sm" variant="outline" onClick={fetchUpdates} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(u) => u.id}
          displayed={displayed}
          totalCount={updates.length}
          noun="employees"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No updates found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No work update data available."
          footerStats={[
            { icon: <Shirt size={11} />,      label: `${totalScanned.toLocaleString()} scanned`                                      },
            { icon: <ShieldCheck size={11} style={{ color: passRateColor(avgPassRate) }} />, label: `${avgPassRate}% pass rate`       },
            ...(totalRework > 0 ? [{ icon: <AlertTriangle size={11} style={{ color: "var(--warning)" }} />, label: `${totalRework} rework` }] : []),
          ]}
          columns={[
            {
              header: "Employee", width: "minmax(160px,2fr)",
              render: (u) => {
                const isFlagged = u.status?.toUpperCase() === "FLAGGED";
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isFlagged ? "var(--error)" : "var(--primary)"}, ${isFlagged ? "var(--destructive)" : "var(--ring)"})` }}>
                      {(u.employeeName ?? "E").charAt(0).toUpperCase()}
                    </div>
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{u.employeeName}</p>
                  </div>
                );
              },
            },
            { header: "Branch", width: "1fr", render: (u) => <p className="text-[12px] font-bold text-card-foreground truncate">{u.branchName}</p> },
            { header: "Shift",  width: "1fr", render: (u) => <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"><Clock size={11} className="shrink-0" />{u.shift}</div> },
            {
              header: "Scanned", width: "1fr",
              render: (u) => (
                <div className="flex items-center gap-1.5">
                  <Shirt size={12} className="text-muted-foreground shrink-0" />
                  <span className="text-[13px] font-black text-card-foreground tabular-nums">{u.garmentsScanned}<span className="text-[10px] font-bold text-muted-foreground ml-1">pcs</span></span>
                </div>
              ),
            },
            {
              header: "Pass Rate", width: "160px",
              render: (u, idx) => {
                const passRate = getPassRate(u);
                const prColor  = passRateColor(passRate);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-muted-foreground"><ShieldCheck size={11} /> Quality</span>
                      <span className="font-black tabular-nums" style={{ color: prColor }}>{u.garmentsScanned > 0 ? `${passRate}%` : "N/A"}</span>
                    </div>
                    {u.garmentsScanned > 0 && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${passRate}%` }} transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.04 }}
                          className="h-full rounded-full" style={{ background: prColor }} />
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              header: "Rework", width: "100px",
              render: (u) => {
                const hasRework = u.reworkRequired > 0;
                return (
                  <div className="flex items-center gap-1.5 text-[13px] font-black tabular-nums" style={hasRework ? { color: "var(--warning)" } : {}}>
                    {hasRework && <AlertTriangle size={12} style={{ color: "var(--warning)" }} className="shrink-0" />}
                    <span className={hasRework ? "" : "text-muted-foreground"}>{u.reworkRequired}</span>
                    <span className="text-[10px] font-bold text-muted-foreground">pcs</span>
                  </div>
                );
              },
            },
            {
              header: "Status", width: "130px",
              render: (u) => { const sm = statusMeta(u.status); return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}><span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}</span>; },
            },
          ]}
        />
      )}
    </div>
  );
}
