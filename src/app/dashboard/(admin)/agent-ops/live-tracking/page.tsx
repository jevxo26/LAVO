"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api";
import {
  Truck, RefreshCw, Navigation, BatteryCharging,
  Phone, CheckCircle2, AlertTriangle, Clock,
  LayoutGrid, List, ArrowUpDown, Search, RotateCcw,
  Wifi, WifiOff, Package, MapPin,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { motion }            from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Agent {
  id:               string;
  agentName:        string;
  phone:            string;
  currentStatus:    string;
  assignedZone:     string;
  lat:              number | string;
  lng:              number | string;
  lastPing:         string;
  activePickups:    number;
  activeDeliveries: number;
  batteryLevel:     string;
}

type SortKey  = "name" | "pickups" | "deliveries" | "battery";
type ViewMode = "grid" | "list";

const AUTO_REFRESH_SEC = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusMeta(s: string): { cls: string; dot: string; label: string } {
  switch (s?.toUpperCase()) {
    case "ON_DELIVERY":
    case "ON DELIVERY":   return { cls: "bg-secondary/10 text-secondary border-secondary/25", dot: "bg-secondary animate-pulse", label: "On Delivery"  };
    case "ON_PICKUP":
    case "ON PICKUP":     return { cls: "bg-primary/10 text-primary border-primary/25",       dot: "bg-primary animate-pulse",   label: "On Pickup"    };
    case "AVAILABLE":
    case "IDLE":          return { cls: "bg-success/10 text-success border-success/25",       dot: "bg-success",                 label: "Available"    };
    case "OFFLINE":
    case "INACTIVE":      return { cls: "bg-muted text-muted-foreground border-border",       dot: "bg-muted-foreground/50",     label: "Offline"      };
    case "BREAK":         return { cls: "bg-warning/10 text-warning border-warning/25",       dot: "bg-warning",                 label: "On Break"     };
    default:              return { cls: "bg-muted text-muted-foreground border-border",       dot: "bg-muted-foreground/50",     label: s || "Unknown" };
  }
}

function batteryColor(level: string): string {
  const n = parseInt(level);
  if (isNaN(n)) return "var(--muted-foreground)";
  if (n <= 20)  return "var(--error)";
  if (n <= 40)  return "var(--warning)";
  return "var(--success)";
}

// ─── Status filter tabs ───────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",         value: "ALL",         dotCls: "bg-muted-foreground/60"    },
  { label: "On Pickup",   value: "ON_PICKUP",   dotCls: "bg-primary animate-pulse"  },
  { label: "On Delivery", value: "ON_DELIVERY", dotCls: "bg-secondary animate-pulse" },
  { label: "Available",   value: "AVAILABLE",   dotCls: "bg-success"                },
  { label: "Offline",     value: "OFFLINE",     dotCls: "bg-muted-foreground/60"    },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[0,1,2,3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1"><Sk className="h-4 w-32" /><Sk className="h-3 w-24" /></div>
            <Sk className="h-5 w-20 rounded-full ml-3" />
          </div>
          <Sk className="h-20 w-full rounded-xl" />
          <div className="flex justify-between pt-2 border-t border-border">
            <Sk className="h-3 w-24" /><Sk className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentLiveTrackingPage() {
  const [agents,     setAgents]     = useState<Agent[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey,    setSortKey]    = useState<SortKey>("name");
  const [viewMode,   setViewMode]   = useState<ViewMode>("grid");
  const [activeTab,  setActiveTab]  = useState("ALL");
  const [search,     setSearch]     = useState("");
  const [connected,  setConnected]  = useState(false);
  const [countdown,  setCountdown]  = useState(AUTO_REFRESH_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAgents = useCallback(() => {
    setRefreshing(true);
    setCountdown(AUTO_REFRESH_SEC);
    authFetch("/agent-ops/live-tracking")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAgents(res.data.map((a: any) => ({
            ...a,
            agentName:   a.agentName   ?? a.fullName ?? a.name ?? "Agent",
            currentStatus: a.currentStatus ?? a.status ?? "AVAILABLE",
          })));
          setConnected(true);
        }
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  // Socket.IO live subscription
  useEffect(() => {
    fetchAgents();
    let socket: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const io = require("socket.io-client");
      socket = io(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000", { transports: ["websocket"] });
      socket.on("connect",           () => setConnected(true));
      socket.on("disconnect",        () => setConnected(false));
      socket.on("agentStatusUpdate", fetchAgents);
      socket.on("agentLocationUpdate", fetchAgents);
    } catch { /* unavailable */ }
    return () => { socket?.disconnect(); };
  }, [fetchAgents]);

  // Auto-refresh countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchAgents(); return AUTO_REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchAgents]);

  // Derived stats
  const onPickup   = agents.filter((a) => a.currentStatus?.toUpperCase().includes("PICKUP")).length;
  const onDelivery = agents.filter((a) => a.currentStatus?.toUpperCase().includes("DELIVERY")).length;
  const available  = agents.filter((a) => ["AVAILABLE","IDLE"].includes(a.currentStatus?.toUpperCase())).length;
  const totalJobs  = agents.reduce((s, a) => s + (a.activePickups || 0) + (a.activeDeliveries || 0), 0);

  const countFor = (val: string) =>
    val === "ALL" ? agents.length
    : agents.filter((a) => {
        const st = a.currentStatus?.toUpperCase();
        if (val === "ON_PICKUP")   return st?.includes("PICKUP");
        if (val === "ON_DELIVERY") return st?.includes("DELIVERY");
        if (val === "AVAILABLE")   return ["AVAILABLE","IDLE"].includes(st ?? "");
        if (val === "OFFLINE")     return ["OFFLINE","INACTIVE"].includes(st ?? "");
        return st === val;
      }).length;

  // Filter + sort
  const displayed = agents
    .filter((a) => {
      const matchSearch = !search.trim() ||
        a.agentName?.toLowerCase().includes(search.toLowerCase()) ||
        a.assignedZone?.toLowerCase().includes(search.toLowerCase()) ||
        a.phone?.includes(search);
      const matchTab = activeTab === "ALL" || (() => {
        const st = a.currentStatus?.toUpperCase();
        if (activeTab === "ON_PICKUP")   return st?.includes("PICKUP");
        if (activeTab === "ON_DELIVERY") return st?.includes("DELIVERY");
        if (activeTab === "AVAILABLE")   return ["AVAILABLE","IDLE"].includes(st ?? "");
        if (activeTab === "OFFLINE")     return ["OFFLINE","INACTIVE"].includes(st ?? "");
        return st === activeTab;
      })();
      return matchSearch && matchTab;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case "pickups":    return (b.activePickups    || 0) - (a.activePickups    || 0);
        case "deliveries": return (b.activeDeliveries || 0) - (a.activeDeliveries || 0);
        case "battery":    return parseInt(b.batteryLevel) - parseInt(a.batteryLevel);
        default:           return a.agentName.localeCompare(b.agentName);
      }
    });

  const hasFilters = search.trim() || activeTab !== "ALL";

  return (
    <div className="space-y-5">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Agent Operations"
        title="Live Fleet Tracking"
        description="Real-time GPS dispatch monitor, active pickup routes, and device battery telemetry across all delivery agents."
        icon={Truck}
        liveLabel={connected ? `${onPickup + onDelivery} Active` : "Manual Refresh"}
        chips={[
          { label: "Total Agents",  value: loading ? "—" : String(agents.length),  sub: "Fleet size"            },
          { label: "On Route",      value: loading ? "—" : String(onPickup + onDelivery), sub: "Pickup + Delivery" },
          { label: "Active Jobs",   value: loading ? "—" : String(totalJobs),       sub: "Pickups + drops"       },
        ]}
      />

      {/* ── 2. Toolbar ──────────────────────────────────────────────────── */}
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

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search agent, zone…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-48 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium
                text-card-foreground placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setActiveTab("ALL"); }}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          {/* Sort */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-8">
            <ArrowUpDown size={11} className="text-muted-foreground shrink-0" />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer">
              <option value="name">Name A–Z</option>
              <option value="pickups">Most Pickups</option>
              <option value="deliveries">Most Deliveries</option>
              <option value="battery">Battery Level</option>
            </select>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted p-1">
            {(["grid","list"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                  viewMode === v ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}>
                {v === "grid" ? <LayoutGrid size={13} /> : <List size={13} />}
              </button>
            ))}
          </div>
          {/* Socket badge + refresh */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black transition-colors ${
            connected ? "border-success/25 bg-success/10 text-success" : "border-border bg-muted text-muted-foreground"}`}>
            {connected ? <><Wifi size={11} className="animate-pulse" /> Live</> : <><WifiOff size={11} /> Manual</>}
          </span>
          <Button size="sm" variant="outline" onClick={fetchAgents} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : `Refresh (${countdown}s)`}
          </Button>
        </div>
      </div>

      {/* ── 3. Content ──────────────────────────────────────────────────── */}
      {loading ? <GridSkeleton /> : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Truck size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-card-foreground">No agents found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasFilters ? "Try adjusting your filters." : "No fleet data available."}
          </p>
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={() => { setSearch(""); setActiveTab("ALL"); }}
              className="mt-3 rounded-xl text-xs font-bold gap-1"><RotateCcw size={12} /> Clear Filters</Button>
          )}
        </div>
      ) : viewMode === "grid" ? (

        // ── Grid ──────────────────────────────────────────────────────────
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {displayed.map((ag) => {
            const sm      = statusMeta(ag.currentStatus);
            const batCol  = batteryColor(ag.batteryLevel);
            const batPct  = Math.min(parseInt(ag.batteryLevel) || 0, 100);

            return (
              <motion.div key={ag.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } }}
                whileHover={{ y: -4, transition: { duration: 0.16 } }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm
                  hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:border-ring/40 transition-all duration-300 flex flex-col gap-4"
              >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-2xl
                  opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500"
                  style={{ background: "var(--primary)" }} />

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                      bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black
                      shadow-md shadow-black/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      {(ag.agentName ?? "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground leading-tight truncate group-hover:text-primary transition-colors">
                        {ag.agentName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Phone size={10} /> {ag.phone}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[9px] font-black shrink-0 ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />
                    {sm.label}
                  </span>
                </div>

                {/* GPS info */}
                <div className="rounded-xl border border-border bg-muted/50 px-3 py-2.5 space-y-1.5">
                  <p className="text-[12px] font-black text-card-foreground flex items-center gap-1.5">
                    <Navigation size={12} className="text-primary shrink-0" />
                    {ag.assignedZone}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {ag.lat}, {ag.lng}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Last ping: {ag.lastPing}
                  </p>
                </div>

                {/* Battery bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <BatteryCharging size={11} /> Battery
                    </span>
                    <span className="tabular-nums font-black" style={{ color: batCol }}>{ag.batteryLevel}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${batPct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: batCol }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-card-foreground">
                    <Package size={11} className="text-muted-foreground" />
                    {ag.activePickups} pkp · {ag.activeDeliveries} drop
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      ) : (

        // ── List ──────────────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border bg-muted/50">
            <div className="grid grid-cols-[minmax(160px,2fr)_1fr_1fr_160px_120px_100px_100px_130px] px-5 py-3 gap-4">
              {["Agent","Zone","Coordinates","Last Ping","Battery","Pickups","Drops","Status"].map((h) => (
                <p key={h} className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
          </div>
          <div className="divide-y divide-border">
            {displayed.map((ag, idx) => {
              const sm     = statusMeta(ag.currentStatus);
              const batCol = batteryColor(ag.batteryLevel);
              const batPct = Math.min(parseInt(ag.batteryLevel) || 0, 100);
              return (
                <motion.div key={ag.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="group grid grid-cols-[minmax(160px,2fr)_1fr_1fr_160px_120px_100px_100px_130px]
                    px-5 py-4 gap-4 items-center hover:bg-muted/40 transition-colors duration-150"
                >
                  {/* Agent */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                      bg-gradient-to-br from-primary to-indigo-700 text-white text-[12px] font-black
                      shadow-md shadow-black/10 transition-transform group-hover:scale-110">
                      {(ag.agentName ?? "A").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{ag.agentName}</p>
                      <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5"><Phone size={10} />{ag.phone}</p>
                    </div>
                  </div>
                  {/* Zone */}
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-card-foreground">
                    <MapPin size={11} className="text-muted-foreground shrink-0" />{ag.assignedZone}
                  </div>
                  {/* Coords */}
                  <p className="text-[10px] font-mono text-muted-foreground">{ag.lat}, {ag.lng}</p>
                  {/* Last ping */}
                  <p className="text-[11px] text-muted-foreground font-medium">{ag.lastPing}</p>
                  {/* Battery */}
                  <div className="space-y-1">
                    <p className="text-[12px] font-black tabular-nums" style={{ color: batCol }}>{ag.batteryLevel}</p>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${batPct}%`, background: batCol }} />
                    </div>
                  </div>
                  {/* Pickups */}
                  <div className="flex items-center gap-1 text-[13px] font-black text-card-foreground">
                    <Package size={12} className="text-muted-foreground" />{ag.activePickups}
                  </div>
                  {/* Drops */}
                  <div className="flex items-center gap-1 text-[13px] font-black text-card-foreground">
                    <Truck size={12} className="text-muted-foreground" />{ag.activeDeliveries}
                  </div>
                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${sm.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${sm.dot}`} />
                    {sm.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing <span className="font-black text-card-foreground">{displayed.length}</span> of{" "}
              <span className="font-black text-card-foreground">{agents.length}</span> agents
            </p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />{onPickup} On Pickup</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />{onDelivery} On Delivery</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />{available} Available</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
