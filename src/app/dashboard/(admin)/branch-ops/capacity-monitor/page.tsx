"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { authFetch } from "@/lib/api";
import Link from "next/link";
import {
  Building2, RefreshCw, Gauge, AlertTriangle,
  CheckCircle2, Package, LayoutGrid, List,
  ArrowUpDown, Store,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Branch {
  id:             string;
  name:           string;
  location:       string;
  loadPercentage: number;
  currentLoadKg:  number;
  capacityKg:     number;
  activeOrders:   number;
  status:         string;
}

type SortKey  = "load-desc" | "load-asc" | "name" | "orders";
type ViewMode = "grid" | "list";

const AUTO_REFRESH_SEC = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadMeta(pct: number): {
  barColor: string; badgeCls: string; icon: React.ElementType; label: string;
} {
  if (pct > 90) return {
    barColor: "var(--error)",
    badgeCls: "bg-error/10 text-error border-error/25",
    icon: AlertTriangle, label: "Overloaded",
  };
  if (pct > 75) return {
    barColor: "var(--warning)",
    badgeCls: "bg-warning/10 text-warning border-warning/25",
    icon: Gauge, label: "High Load",
  };
  return {
    barColor: "var(--success)",
    badgeCls: "bg-success/10 text-success border-success/25",
    icon: CheckCircle2, label: "Normal",
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className ?? ""}`} />;
}

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Sk className="h-4 w-36" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-5 w-16 rounded-full ml-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Sk className="h-3 w-24" />
              <Sk className="h-3 w-8" />
            </div>
            <Sk className="h-2.5 w-full rounded-full" />
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BranchCapacityMonitorPage() {
  const [branches,   setBranches]   = useState<Branch[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey,    setSortKey]    = useState<SortKey>("load-desc");
  const [viewMode,   setViewMode]   = useState<ViewMode>("grid");
  const [countdown,  setCountdown]  = useState(AUTO_REFRESH_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCapacity = useCallback(() => {
    setRefreshing(true);
    setCountdown(AUTO_REFRESH_SEC);
    authFetch("/branch-ops/capacity-monitor")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setBranches(res.data.map((b: any) => ({
            ...b,
            name:     b.name ?? b.branchName ?? b.hubName ?? "Branch",
            location: b.location ?? b.address ?? b.city ?? "—",
          })));
        }
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchCapacity(); }, [fetchCapacity]);

  // ── Auto-refresh countdown ─────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchCapacity(); return AUTO_REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchCapacity]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  const sorted = [...branches].sort((a, b) => {
    switch (sortKey) {
      case "load-desc": return b.loadPercentage - a.loadPercentage;
      case "load-asc":  return a.loadPercentage - b.loadPercentage;
      case "orders":    return b.activeOrders   - a.activeOrders;
      case "name":      return a.name.localeCompare(b.name);
      default:          return 0;
    }
  });

  // ── Derived stats ─────────────────────────────────────────────────────────
  const overloaded = branches.filter((b) => b.loadPercentage > 90).length;
  const highLoad   = branches.filter((b) => b.loadPercentage > 75 && b.loadPercentage <= 90).length;
  const avgLoad    = branches.length > 0
    ? Math.round(branches.reduce((s, b) => s + b.loadPercentage, 0) / branches.length)
    : 0;
  const totalOrders = branches.reduce((s, b) => s + b.activeOrders, 0);

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Branch Operations"
        title="Capacity Monitor"
        description="Real-time wash capacity, garment load distribution, and hub congestion control. Auto-refreshes every 30 seconds."
        icon={Building2}
        liveLabel={overloaded > 0 ? `${overloaded} Overloaded` : "All Operational"}
        chips={[
          { label: "Total Branches", value: loading ? "—" : branches.length,               sub: "Active hubs"                                    },
          { label: "Avg Load",       value: loading ? "—" : `${avgLoad}%`,               sub: avgLoad > 75 ? "High pressure" : "Normal range"  },
          { label: "Active Orders",  value: loading ? "—" : String(totalOrders),          sub: "Across all branches"                             },
        ]}
      />

      {/* ── 2. Toolbar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Left — status pills */}
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
            {overloaded === 0 && highLoad === 0 && branches.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-[11px] font-black text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                All Normal
              </span>
            )}
          </div>
        )}

        {/* Right — sort + view toggle + refresh */}
        <div className="flex items-center gap-2 sm:ml-auto">

          {/* Sort select */}
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-8">
            <ArrowUpDown size={11} className="text-muted-foreground shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer"
            >
              <option value="load-desc">Highest Load</option>
              <option value="load-asc">Lowest Load</option>
              <option value="orders">Most Orders</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 rounded-xl border border-border bg-muted p-1">
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${
                  viewMode === v
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-card-foreground"
                }`}
              >
                {v === "grid" ? <LayoutGrid size={13} /> : <List size={13} />}
              </button>
            ))}
          </div>

          {/* Auto-refresh countdown + manual refresh */}
          <Button
            size="sm" variant="outline"
            onClick={fetchCapacity}
            className="h-8 rounded-xl text-xs font-bold gap-1.5"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing…" : `Refresh (${countdown}s)`}
          </Button>
        </div>
      </div>

      {/* ── 3. Overload Alert Banner ──────────────────────────────────────── */}
      <AnimatePresence>
        {!loading && overloaded > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4
              rounded-2xl border border-error/25 bg-error/8 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/15">
                <AlertTriangle size={18} className="text-error" />
              </div>
              <div>
                <p className="text-sm font-black text-card-foreground">
                  {overloaded} Branch{overloaded > 1 ? "es" : ""} Over Capacity
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Delegate garments to partner vendors to prevent processing delays.
                </p>
              </div>
            </div>
            <Link href="/dashboard/partner-vendors">
              <Button size="sm"
                className="h-9 rounded-xl text-xs font-black gap-1.5 shrink-0
                  bg-gradient-to-br from-error to-rose-600 text-white hover:opacity-90
                  transition-all hover:scale-[1.02] shadow-sm">
                <Store size={13} /> Delegate to Vendors
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Branch cards / list ────────────────────────────────────────── */}
      {loading ? (
        <CardsSkeleton />
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Building2 size={24} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-card-foreground">No branch data</p>
          <p className="mt-1 text-xs text-muted-foreground">Branch capacity data will appear here.</p>
          <Button size="sm" variant="outline" onClick={fetchCapacity}
            className="mt-4 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} /> Retry
          </Button>
        </div>
      ) : viewMode === "grid" ? (

        // ── Grid view ───────────────────────────────────────────────────────
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {sorted.map((b) => {
            const { barColor, badgeCls, icon: StatusIcon } = loadMeta(b.loadPercentage);
            const pct = Math.min(b.loadPercentage, 100);
            const isOverloaded = b.loadPercentage > 90;

            return (
              <motion.div
                key={b.id}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } }}
                whileHover={{ y: -4, transition: { duration: 0.16 } }}
                className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm
                  hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-300 flex flex-col gap-4"
                style={{
                  borderColor: isOverloaded
                    ? "color-mix(in srgb, var(--error) 30%, var(--border))"
                    : "var(--border)",
                }}
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
                      <Building2 size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-black text-card-foreground leading-tight truncate
                        group-hover:text-primary transition-colors">
                        {b.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                        {b.location}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px]
                    text-[10px] font-black shrink-0 ${badgeCls}`}>
                    <StatusIcon size={10} />
                    {b.status}
                  </span>
                </div>

                {/* Load bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground">{b.currentLoadKg} kg / {b.capacityKg} kg</span>
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
                    <Gauge size={12} /> Max {b.capacityKg} kg/day
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-card-foreground">
                    <Package size={12} className="text-muted-foreground" />
                    {b.activeOrders} orders
                  </div>
                </div>

                {/* Delegate CTA — only on overloaded */}
                {isOverloaded && (
                  <Link href="/dashboard/partner-vendors">
                    <Button size="sm"
                      className="w-full h-8 rounded-xl text-[11px] font-black gap-1.5
                        bg-gradient-to-br from-error to-rose-600 text-white hover:opacity-90
                        transition-all hover:scale-[1.01] shadow-sm">
                      <Store size={12} /> Delegate to Vendor
                    </Button>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>

      ) : (

        // ── List view ───────────────────────────────────────────────────────
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="border-b border-border bg-muted/50 px-5 py-3">
            <div className="grid grid-cols-[minmax(200px,2fr)_140px_140px_100px_120px_120px] gap-4 items-center">
              {["Branch", "Capacity Load", "Weight (kg)", "Orders", "Status", "Action"].map((h) => (
                <p key={h} className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                  {h}
                </p>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {sorted.map((b, idx) => {
              const { barColor, badgeCls, icon: StatusIcon } = loadMeta(b.loadPercentage);
              const pct        = Math.min(b.loadPercentage, 100);
              const isOverloaded = b.loadPercentage > 90;

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group px-5 py-4 hover:bg-muted/40 transition-colors duration-150"
                >
                  <div className="grid grid-cols-[minmax(200px,2fr)_140px_140px_100px_120px_120px] gap-4 items-center">

                    {/* Branch name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
                          text-white text-[12px] font-black shadow-md shadow-black/10
                          transition-transform duration-200 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${isOverloaded ? "var(--error)" : "var(--primary)"}, ${isOverloaded ? "var(--destructive)" : "var(--ring)"})`,
                        }}
                      >
                        {(b.name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-black text-card-foreground truncate group-hover:text-primary transition-colors">
                          {b.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                          {b.location}
                        </p>
                      </div>
                    </div>

                    {/* Capacity load — % + progress bar */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[13px] font-black tabular-nums"
                          style={{ color: barColor }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: idx * 0.04 }}
                          className="h-full rounded-full"
                          style={{ background: barColor }}
                        />
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-black text-card-foreground tabular-nums">
                        {b.currentLoadKg} kg
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        of {b.capacityKg} kg max
                      </p>
                    </div>

                    {/* Active orders */}
                    <div className="flex items-center gap-1.5">
                      <Package size={13} className="text-muted-foreground shrink-0" />
                      <span className="text-[13px] font-black text-card-foreground tabular-nums">
                        {b.activeOrders}
                      </span>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px]
                      text-[10px] font-black w-fit ${badgeCls}`}>
                      <StatusIcon size={10} />
                      {b.status}
                    </span>

                    {/* Action */}
                    {isOverloaded ? (
                      <Link href="/dashboard/partner-vendors">
                        <Button size="sm"
                          className="h-8 w-full rounded-xl text-[11px] font-black gap-1
                            bg-gradient-to-br from-error to-rose-600 text-white
                            hover:opacity-90 transition-all hover:scale-[1.02] shadow-sm">
                          <Store size={11} /> Delegate
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-medium">—</span>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
            <p className="text-[11px] text-muted-foreground font-medium">
              Showing <span className="font-black text-card-foreground">{sorted.length}</span> branches
            </p>
            <p className="text-[11px] text-muted-foreground font-medium tabular-nums">
              Total active orders:{" "}
              <span className="font-black text-card-foreground">{String(totalOrders || 0)}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
