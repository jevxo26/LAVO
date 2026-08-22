"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api";
import Link from "next/link";
import {
  Store, Gauge, RefreshCw, AlertTriangle,
  CheckCircle2, Package, Star, LayoutGrid,
  List, ArrowUpDown, Wifi, WifiOff,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id:               string;
  vendorName:       string;
  serviceFocus:     string;
  rating:           number;
  loadPercentage:   number;
  activeLoadKg:     number;
  dailyCapacityKg:  number;
  assignedOrders:   number;
  status:           string;
}

type SortKey  = "load-desc" | "load-asc" | "name" | "rating" | "orders";
type ViewMode = "grid" | "list";

const AUTO_REFRESH_SEC = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadMeta(pct: number): {
  barColor: string; badgeCls: string; icon: React.ElementType; label: string;
} {
  if (pct > 90) return { barColor: "var(--error)",   badgeCls: "bg-error/10 text-error border-error/25",     icon: AlertTriangle, label: "Overloaded" };
  if (pct > 70) return { barColor: "var(--warning)", badgeCls: "bg-warning/10 text-warning border-warning/25", icon: Gauge,         label: "High Load"  };
  return              { barColor: "var(--success)", badgeCls: "bg-success/10 text-success border-success/25", icon: CheckCircle2,  label: "Normal"     };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[0,1,2,3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1"><Sk className="h-4 w-36" /><Sk className="h-3 w-24" /></div>
            <Sk className="h-5 w-12 rounded-full ml-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><Sk className="h-3 w-24" /><Sk className="h-3 w-8" /></div>
            <Sk className="h-2.5 w-full rounded-full" />
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <Sk className="h-3 w-24" /><Sk className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorCapacityMonitorPage() {
  const [vendors,    setVendors]    = useState<Vendor[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey,    setSortKey]    = useState<SortKey>("load-desc");
  const [viewMode,   setViewMode]   = useState<ViewMode>("grid");
  const [countdown,  setCountdown]  = useState(AUTO_REFRESH_SEC);
  const [connected,  setConnected]  = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVendors = useCallback(() => {
    setRefreshing(true);
    setCountdown(AUTO_REFRESH_SEC);
    authFetch("/vendor-ops/capacity-monitor")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setVendors(res.data.map((v: any) => ({
            ...v,
            vendorName:   v.vendorName   ?? v.name      ?? "Vendor",
            serviceFocus: v.serviceFocus ?? v.specialty ?? "—",
          })));
          setConnected(true);
        }
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // ── Auto-refresh countdown ─────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchVendors(); return AUTO_REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchVendors]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = [...vendors].sort((a, b) => {
    switch (sortKey) {
      case "load-desc": return b.loadPercentage - a.loadPercentage;
      case "load-asc":  return a.loadPercentage - b.loadPercentage;
      case "rating":    return (b.rating ?? 0)  - (a.rating ?? 0);
      case "orders":    return b.assignedOrders  - a.assignedOrders;
      case "name":      return a.vendorName.localeCompare(b.vendorName);
      default:          return 0;
    }
  });

  // ── Derived stats ─────────────────────────────────────────────────────────
  const overloaded  = vendors.filter((v) => v.loadPercentage > 90).length;
  const highLoad    = vendors.filter((v) => v.loadPercentage > 70 && v.loadPercentage <= 90).length;
  const avgLoad     = vendors.length > 0
    ? Math.round(vendors.reduce((s, v) => s + (v.loadPercentage || 0), 0) / vendors.length)
    : 0;
  const totalOrders = vendors.reduce((s, v) => s + (v.assignedOrders || 0), 0);
  const avgRating   = vendors.length > 0
    ? (vendors.reduce((s, v) => s + (v.rating || 0), 0) / vendors.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Operations"
        title="Vendor Capacity Monitor"
        description="Monitor partner laundry vendor load, service specialisations, ratings, and daily capacity limits across the network."
        icon={Store}
        liveLabel={overloaded > 0 ? `${overloaded} Overloaded` : "All Operational"}
        chips={[
          { label: "Total Vendors",  value: loading ? "—" : String(vendors.length), sub: "Active partners"                           },
          { label: "Avg Load",       value: loading ? "—" : `${avgLoad}%`,          sub: avgLoad > 70 ? "High pressure" : "Normal"   },
          { label: "Avg Rating",     value: loading ? "—" : String(avgRating),      sub: "Platform average"                          },
        ]}
      />

      {/* ── 2. Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Status pills */}
        {!loading && (
          <div className="flex flex-wrap items-center gap-1.5">
            {overloaded > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-error/25 bg-error/10 px-2.5 py-0.5 text-[11px] font-black text-error">
                <span className="h-1.5 w-1.5 rounded-full bg-error animate-pulse" />
                {overloaded} Overloaded
              </span>
            )}
            {highLoad > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning/10 px-2.5 py-0.5 text-[11px] font-black text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                {highLoad} High Load
              </span>
            )}
            {overloaded === 0 && highLoad === 0 && vendors.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[11px] font-black text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                All Normal
              </span>
            )}
          </div>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* Sort */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-8">
            <ArrowUpDown size={11} className="text-muted-foreground shrink-0" />
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer">
              <option value="load-desc">Highest Load</option>
              <option value="load-asc">Lowest Load</option>
              <option value="rating">Best Rating</option>
              <option value="orders">Most Orders</option>
              <option value="name">Name A–Z</option>
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

          {/* Socket + refresh */}
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black transition-colors ${
            connected ? "border-success/25 bg-success/10 text-success" : "border-border bg-muted text-muted-foreground"}`}>
            {connected ? <><Wifi size={11} className="animate-pulse" /> Live</> : <><WifiOff size={11} /> Manual</>}
          </span>

          <Button size="sm" variant="outline" onClick={fetchVendors} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : `Refresh (${countdown}s)`}
          </Button>
        </div>
      </div>

      {/* ── 3. Overload alert ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && overloaded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-error/25 bg-error/8 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/15">
                <AlertTriangle size={18} className="text-error" />
              </div>
              <div>
                <p className="text-sm font-black text-card-foreground">
                  {overloaded} Vendor{overloaded > 1 ? "s" : ""} Over Capacity
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  These vendors cannot accept more delegated orders. Reassign to available partners.
                </p>
              </div>
            </div>
            <Link href="/dashboard/partner-vendors">
              <Button size="sm"
                className="h-9 rounded-xl text-xs font-black gap-1.5 shrink-0
                  bg-gradient-to-br from-error to-rose-600 text-white hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm">
                <Store size={13} /> View Partner Vendors
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Cards / List ─────────────────────────────────────────────────── */}
      {loading ? <CardsSkeleton /> : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Store size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-card-foreground">No vendor data</p>
          <p className="mt-1 text-xs text-muted-foreground">Partner vendor capacity data will appear here.</p>
          <Button size="sm" variant="outline" onClick={fetchVendors} className="mt-4 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} /> Retry
          </Button>
        </div>
      ) : viewMode === "grid" ? (

        // ── Grid ──────────────────────────────────────────────────────────────
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {sorted.map((v) => {
            const { barColor, badgeCls, icon: StatusIcon } = loadMeta(v.loadPercentage);
            const pct = Math.min(v.loadPercentage ?? 0, 100);
            const isOverloaded = v.loadPercentage > 90;

            return (
              <motion.div
                key={v.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } }}
                whileHover={{ y: -4, transition: { duration: 0.16 } }}
                className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm
                  hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300 flex flex-col gap-4"
                style={{ borderColor: isOverloaded ? "color-mix(in srgb, var(--error) 30%, var(--border))" : "var(--border)" }}
              >
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-2xl
                  opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500"
                  style={{ background: barColor }} />

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white
                      shadow-md shadow-black/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: `linear-gradient(135deg, ${isOverloaded ? "var(--error)" : "var(--primary)"}, ${isOverloaded ? "var(--destructive)" : "var(--ring)"})` }}>
                      <Store size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground leading-tight truncate group-hover:text-primary transition-colors">
                        {v.vendorName}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                        {v.serviceFocus}
                      </p>
                    </div>
                  </div>
                  {/* Rating + status */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="flex items-center gap-1 rounded-full border border-warning/25 bg-warning/10 px-2 py-[2px] text-[10px] font-black text-warning">
                      <Star size={9} className="fill-warning" /> {v.rating ?? "—"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[9px] font-black ${badgeCls}`}>
                      <StatusIcon size={9} />
                      {loadMeta(v.loadPercentage).label}
                    </span>
                  </div>
                </div>

                {/* Load bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground">{v.activeLoadKg ?? 0} kg / {v.dailyCapacityKg ?? 0} kg</span>
                    <span className="text-card-foreground tabular-nums">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: barColor }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <Gauge size={12} /> Limit {v.dailyCapacityKg ?? 0} kg/day
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-card-foreground">
                    <Package size={12} className="text-muted-foreground" />
                    {v.assignedOrders ?? 0} orders
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      ) : (

        // ── List ──────────────────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border bg-muted/50">
            <div className="grid grid-cols-[minmax(180px,2fr)_1fr_140px_140px_100px_120px_120px] px-5 py-3 gap-4">
              {["Vendor","Service Focus","Capacity Load","Weight (kg)","Orders","Rating","Status"].map((h) => (
                <p key={h} className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">{h}</p>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {sorted.map((v, idx) => {
              const { barColor, badgeCls, icon: StatusIcon } = loadMeta(v.loadPercentage);
              const pct = Math.min(v.loadPercentage ?? 0, 100);
              const isOverloaded = v.loadPercentage > 90;

              return (
                <motion.div key={v.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="group grid grid-cols-[minmax(180px,2fr)_1fr_140px_140px_100px_120px_120px]
                    px-5 py-4 gap-4 items-center hover:bg-muted/40 transition-colors duration-150"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[12px] font-black shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${isOverloaded ? "var(--error)" : "var(--primary)"}, var(--ring))` }}>
                      {(v.vendorName ?? "V").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">{v.vendorName}</p>
                    </div>
                  </div>

                  {/* Service focus */}
                  <p className="text-[11px] text-muted-foreground font-medium truncate">{v.serviceFocus}</p>

                  {/* Load % + bar */}
                  <div className="space-y-1.5">
                    <p className="text-[13px] font-black tabular-nums" style={{ color: barColor }}>{pct}%</p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-black text-card-foreground tabular-nums">{v.activeLoadKg ?? 0} kg</p>
                    <p className="text-[11px] text-muted-foreground font-medium">of {v.dailyCapacityKg ?? 0} kg max</p>
                  </div>

                  {/* Orders */}
                  <div className="flex items-center gap-1.5">
                    <Package size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-[13px] font-black text-card-foreground tabular-nums">{v.assignedOrders ?? 0}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-[12px] font-black text-warning">
                    <Star size={12} className="fill-warning shrink-0" />
                    {v.rating ?? "—"}
                  </div>

                  {/* Status */}
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black w-fit ${badgeCls}`}>
                    <StatusIcon size={10} />
                    {loadMeta(v.loadPercentage).label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing <span className="font-black text-card-foreground">{sorted.length}</span> vendors
            </p>
            <p className="text-[11px] text-muted-foreground font-medium tabular-nums">
              Total assigned orders: <span className="font-black text-card-foreground">{String(totalOrders)}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
