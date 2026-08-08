"use client";

import React, { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { Truck, RefreshCw, CheckCircle2, AlertTriangle, Gauge, Search, RotateCcw, Calendar, BatteryCharging, User } from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";

interface Vehicle {
  id: string; vehicleNumber: string; type: string; assignedAgent: string;
  fuelOrBattery: string; odometerKm: number | string; maintenanceDueDate: string; status: string;
}

function conditionMeta(s: string) {
  switch (s?.toUpperCase()) {
    case "EXCELLENT":     return { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success",               label: "Excellent"     };
    case "GOOD":          return { cls: "bg-primary/10 text-primary border-primary/25",   dot: "bg-primary",               label: "Good"          };
    case "FAIR":          return { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning animate-pulse", label: "Fair"          };
    case "POOR":
    case "NEEDS_SERVICE": return { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error animate-pulse",   label: "Needs Service" };
    default:              return { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50",   label: s || "Unknown"  };
  }
}
function fuelColor(level: string) {
  const n = parseInt(level);
  if (isNaN(n)) return "var(--muted-foreground)";
  if (n <= 20) return "var(--error)";
  if (n <= 40) return "var(--warning)";
  return "var(--success)";
}
function isServiceSoon(dateStr: string) {
  if (!dateStr) return false;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000) <= 7;
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
            <div className="space-y-1.5 flex-1"><Sk className="h-4 w-28" /></div>
            <Sk className="h-5 w-20 rounded-full" /><Sk className="h-3 w-24" /><Sk className="h-3 w-16" />
            <Sk className="h-3 w-20" /><Sk className="h-3 w-24" /><Sk className="h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { label: "All",           value: "ALL",       dotCls: "bg-muted-foreground/60"   },
  { label: "Excellent",     value: "EXCELLENT", dotCls: "bg-success"               },
  { label: "Good",          value: "GOOD",      dotCls: "bg-primary"               },
  { label: "Fair",          value: "FAIR",      dotCls: "bg-warning animate-pulse" },
  { label: "Needs Service", value: "POOR",      dotCls: "bg-error animate-pulse"   },
];

export default function AgentVehicleStatusPage() {
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("ALL");

  const fetchVehicles = useCallback(() => {
    setRefreshing(true);
    authFetch("/agent-ops/vehicle-status")
      .then((r) => r.json())
      .then((res) => { if (res?.success && Array.isArray(res.data)) setVehicles(res.data); })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const excellent   = vehicles.filter((v) => v.status?.toUpperCase() === "EXCELLENT").length;
  const needService = vehicles.filter((v) => ["POOR","NEEDS_SERVICE"].includes(v.status?.toUpperCase())).length;
  const serviceSoon = vehicles.filter((v) => isServiceSoon(v.maintenanceDueDate)).length;

  const countFor = (val: string) =>
    val === "ALL" ? vehicles.length
    : val === "POOR" ? vehicles.filter((v) => ["POOR","NEEDS_SERVICE"].includes(v.status?.toUpperCase())).length
    : vehicles.filter((v) => v.status?.toUpperCase() === val).length;

  const displayed = vehicles.filter((v) => {
    const q = search.toLowerCase();
    const matchTab = activeTab === "ALL" ? true
      : activeTab === "POOR" ? ["POOR","NEEDS_SERVICE"].includes(v.status?.toUpperCase())
      : v.status?.toUpperCase() === activeTab;
    return (!q || v.vehicleNumber?.toLowerCase().includes(q) || v.assignedAgent?.toLowerCase().includes(q) || v.type?.toLowerCase().includes(q)) && matchTab;
  });

  const hasFilters = !!(search.trim() || activeTab !== "ALL");
  const clearFilters = () => { setSearch(""); setActiveTab("ALL"); };

  return (
    <div className="space-y-5">
      <DashboardPageHero
        badge="Agent Operations" title="Fleet Vehicle Status & Maintenance"
        description="Monitor electric delivery vans, cargo scooters, mileage logs, fuel/charge levels, and scheduled servicing across the fleet."
        icon={Truck}
        liveLabel={needService > 0 ? `${needService} Needs Service` : serviceSoon > 0 ? `${serviceSoon} Service Soon` : "Fleet Healthy"}
        chips={[
          { label: "Total Vehicles", value: loading ? "—" : String(vehicles.length), sub: "Active fleet"                                       },
          { label: "Service Soon",   value: loading ? "—" : String(serviceSoon),      sub: serviceSoon  > 0 ? "Within 7 days"  : "None due"    },
          { label: "Needs Service",  value: loading ? "—" : String(needService),      sub: needService  > 0 ? "Urgent attention": "All clear"   },
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
            <input type="text" placeholder="Search vehicle, agent, type…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && <Button size="sm" variant="ghost" onClick={clearFilters} className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5"><RotateCcw size={12} /> Clear</Button>}
          <Button size="sm" variant="outline" onClick={fetchVehicles} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={activeTab + search}
          keyExtractor={(v) => v.id}
          displayed={displayed}
          totalCount={vehicles.length}
          noun="vehicles"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No vehicles found"
          emptyFiltered="Try adjusting your filters."
          emptyDefault="No vehicle data available."
          footerStats={[
            { dot: "bg-success", label: "Excellent",    value: excellent   },
            ...(serviceSoon > 0 ? [{ dot: "bg-warning", label: "Service Soon",  value: serviceSoon, pulse: true }] : []),
            ...(needService > 0 ? [{ dot: "bg-error",   label: "Needs Service", value: needService, pulse: true }] : []),
          ]}
          columns={[
            {
              header: "Vehicle", width: "minmax(140px,1.5fr)",
              render: (v) => {
                const isCritical = ["POOR","NEEDS_SERVICE"].includes(v.status?.toUpperCase());
                return (
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-black/10 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isCritical ? "var(--error)" : "var(--primary)"}, ${isCritical ? "var(--destructive)" : "var(--ring)"})` }}>
                      <Truck size={15} strokeWidth={2.3} />
                    </div>
                    <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{v.vehicleNumber}</p>
                  </div>
                );
              },
            },
            { header: "Type", width: "1fr", render: (v) => <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-[3px] text-[10px] font-black text-muted-foreground w-fit">{v.type}</span> },
            {
              header: "Assigned Agent", width: "1.5fr",
              render: (v) => <div className="flex items-center gap-2 min-w-0"><User size={12} className="text-muted-foreground shrink-0" /><p className="text-[12px] font-bold text-card-foreground truncate">{v.assignedAgent}</p></div>,
            },
            {
              header: "Fuel / Battery", width: "130px",
              render: (v, idx) => {
                const fuelCol = fuelColor(v.fuelOrBattery);
                const fuelPct = Math.min(parseInt(v.fuelOrBattery) || 0, 100);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <BatteryCharging size={11} className="shrink-0" style={{ color: fuelCol }} />
                      <span className="text-[12px] font-black tabular-nums" style={{ color: fuelCol }}>{v.fuelOrBattery}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${fuelPct}%` }} transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.04 }}
                        className="h-full rounded-full" style={{ background: fuelCol }} />
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Odometer", width: "1fr",
              render: (v) => <div className="flex items-center gap-1.5"><Gauge size={12} className="text-muted-foreground shrink-0" /><span className="text-[12px] font-bold text-card-foreground tabular-nums">{v.odometerKm} km</span></div>,
            },
            {
              header: "Service Due", width: "150px",
              render: (v) => {
                const soon = isServiceSoon(v.maintenanceDueDate);
                return (
                  <div className={`flex items-center gap-1.5 text-[11px] font-medium ${soon ? "text-warning font-black" : "text-muted-foreground"}`}>
                    <Calendar size={11} className="shrink-0" />{v.maintenanceDueDate}
                    {soon && <span className="inline-flex items-center rounded-full border border-warning/25 bg-warning/10 px-1.5 py-px text-[9px] font-black text-warning">Soon</span>}
                  </div>
                );
              },
            },
            {
              header: "Condition", width: "130px",
              render: (v) => { const cm = conditionMeta(v.status); return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${cm.cls}`}><span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cm.dot}`} />{cm.label}</span>; },
            },
          ]}
        />
      )}
    </div>
  );
}
