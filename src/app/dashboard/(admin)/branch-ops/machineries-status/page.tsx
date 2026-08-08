"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import {
  Wrench, RefreshCw, CheckCircle2, AlertTriangle,
  Clock, Search, RotateCcw, Thermometer, Zap,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Machine {
  id:              string;
  machineName:     string;
  branchName:      string;
  category:        string;
  temperature:     string;
  efficiency:      string;
  status:          string;
  lastMaintenance: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "RUNNING":     return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success animate-pulse", label: "Running"     };
    case "MAINTENANCE": return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error",                 label: "Maintenance" };
    case "IDLE":        return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning",               label: "Idle"        };
    default:            return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "Unknown" };
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}
function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4 flex gap-3">
        <Sk className="h-9 flex-1 rounded-xl max-w-sm" /><Sk className="h-9 w-36 rounded-xl" />
      </div>
      <div className="divide-y divide-border">
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="space-y-1.5 flex-1"><Sk className="h-4 w-40" /><Sk className="h-3 w-20" /></div>
            <Sk className="h-3 w-24" /><Sk className="h-5 w-20 rounded-full" />
            <Sk className="h-3 w-16" /><Sk className="h-3 w-16" /><Sk className="h-5 w-20 rounded-full" /><Sk className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",         value: "ALL",         dotCls: "bg-muted-foreground/60"   },
  { label: "Running",     value: "RUNNING",     dotCls: "bg-success animate-pulse" },
  { label: "Idle",        value: "IDLE",        dotCls: "bg-warning"               },
  { label: "Maintenance", value: "MAINTENANCE", dotCls: "bg-error"                 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MachineriesStatusPage() {
  const [machines,   setMachines]   = useState<Machine[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchMachines = useCallback(() => {
    setRefreshing(true);
    authFetch("/branch-ops/machineries-status")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setMachines(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchMachines(); }, [fetchMachines]);

  const running     = machines.filter((m) => m.status?.toUpperCase() === "RUNNING").length;
  const maintenance = machines.filter((m) => m.status?.toUpperCase() === "MAINTENANCE").length;
  const idle        = machines.filter((m) => m.status?.toUpperCase() === "IDLE").length;

  const countFor = (val: string) =>
    val === "ALL" ? machines.length : machines.filter((m) => m.status?.toUpperCase() === val).length;

  const displayed = machines.filter((m) => {
    const q = search.toLowerCase();
    return (
      (!q || m.machineName?.toLowerCase().includes(q) || m.branchName?.toLowerCase().includes(q) || m.id?.toLowerCase().includes(q)) &&
      (activeTab === "ALL" || m.status?.toUpperCase() === activeTab)
    );
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Branch Operations" title="Machineries & Equipment Telemetry"
        description="Monitor washing machines, tumble dryers, steam presses, and dry cleaning units across all branches in real-time."
        icon={Wrench}
        liveLabel={maintenance > 0 ? `${maintenance} Under Maintenance` : "All Systems Nominal"}
        chips={[
          { label: "Total Units",  value: loading ? "—" : String(machines.length), sub: "All equipment"       },
          { label: "Running",      value: loading ? "—" : String(running),          sub: "Actively processing" },
          { label: "Maintenance",  value: loading ? "—" : String(maintenance),      sub: maintenance > 0 ? "Needs attention" : "None" },
        ]}
      />

      {/* Toolbar */}
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
            <input type="text" placeholder="Search machine, branch…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchMachines} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(m) => m.id}
          displayed={displayed}
          totalCount={machines.length}
          noun="machines"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No machines found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No equipment data available."
          footerStats={[
            { dot: "bg-success",  label: "Running",     value: running,     pulse: true  },
            { dot: "bg-warning",  label: "Idle",        value: idle                       },
            { dot: "bg-error",    label: "Maintenance", value: maintenance                 },
          ]}
          columns={[
            {
              header: "Equipment", width: "minmax(180px,2fr)",
              render: (m) => (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
                    <Wrench size={15} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-black text-card-foreground leading-tight truncate group-hover:text-primary transition-colors">{m.machineName}</p>
                    <p className="text-[11px] text-primary/70 font-mono font-bold mt-0.5">{m.id}</p>
                  </div>
                </div>
              ),
            },
            {
              header: "Branch", width: "1fr",
              render: (m) => <p className="text-[13px] font-bold text-card-foreground truncate">{m.branchName}</p>,
            },
            {
              header: "Category", width: "1fr",
              render: (m) => (
                <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">
                  {m.category}
                </span>
              ),
            },
            {
              header: "Temp", width: "120px",
              render: (m) => (
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-card-foreground">
                  <Thermometer size={13} className="text-muted-foreground shrink-0" />{m.temperature}
                </div>
              ),
            },
            {
              header: "Efficiency", width: "120px",
              render: (m) => (
                <div className="flex items-center gap-1.5 text-[13px] font-black" style={{ color: "var(--success)" }}>
                  <Zap size={13} className="shrink-0" style={{ color: "var(--success)" }} />{m.efficiency}
                </div>
              ),
            },
            {
              header: "Status", width: "130px",
              render: (m) => {
                const sm = statusMeta(m.status);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />{sm.label}
                  </span>
                );
              },
            },
            {
              header: "Last Maintenance", width: "1fr",
              render: (m) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                  <Clock size={11} className="shrink-0" />{m.lastMaintenance}
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
