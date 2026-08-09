"use client";

import React, { useEffect, useState, useMemo } from "react";
import { authFetch } from "@/lib/api";
import {
  Activity, RefreshCw, Lock, Search, AlertCircle,
  Filter, Shield, Eye, Globe, Sliders, RotateCcw,
  FileText, Clock, Cpu, CheckCircle2,
} from "lucide-react";
import { Button }            from "@/components/ui/button";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";
import { OpsTable }          from "@/components/shared/OpsTable";
import { motion }            from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditLogItem {
  id:          string;
  module:      string;
  action:      string;
  performedBy: string;
  oldValue?:   string | null;
  newValue?:   string | null;
  ipAddress?:  string | null;
  createdAt:   string;
}

// ─── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK: AuditLogItem[] = [
  { id: "aud-901", module: "PRICING_TAX",     action: "UPDATE_TAX_RATE",        performedBy: "Super Admin (admin@laundrix.com)",   oldValue: JSON.stringify({ vatPercentage: 5.0,  expressSurcharge: 10 }), newValue: JSON.stringify({ vatPercentage: 7.5,  expressSurcharge: 15 }), ipAddress: "103.48.26.11", createdAt: new Date(Date.now() - 3600000 * 1).toISOString()  },
  { id: "aud-902", module: "PAYOUTS",         action: "APPROVE_VENDOR_PAYOUT",  performedBy: "Super Admin (admin@laundrix.com)",   oldValue: JSON.stringify({ payoutId: "pay-101", status: "PENDING", amount: 15500 }), newValue: JSON.stringify({ payoutId: "pay-101", status: "PAID", amount: 15500 }), ipAddress: "103.48.26.11", createdAt: new Date(Date.now() - 3600000 * 3).toISOString()  },
  { id: "aud-903", module: "ROLE_MANAGEMENT", action: "ELEVATE_USER_ROLE",      performedBy: "Super Admin (admin@laundrix.com)",   oldValue: JSON.stringify({ userId: "u-401", role: "CUSTOMER" }),               newValue: JSON.stringify({ userId: "u-401", role: "VENDOR" }),               ipAddress: "103.48.26.14", createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "aud-904", module: "FEATURE_FLAGS",   action: "TOGGLE_EXPRESS_DELIVERY",performedBy: "System Admin (sysadmin@laundrix.com)", oldValue: JSON.stringify({ feature: "EXPRESS_SAME_DAY", isEnabled: false }),  newValue: JSON.stringify({ feature: "EXPRESS_SAME_DAY", isEnabled: true }),  ipAddress: "103.48.26.18", createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "aud-905", module: "SYSTEM_SETTINGS", action: "UPDATE_DELIVERY_CHARGES",performedBy: "Super Admin (admin@laundrix.com)",   oldValue: JSON.stringify({ baseDeliveryFee: 60, freeDeliveryMin: 1000 }),       newValue: JSON.stringify({ baseDeliveryFee: 80, freeDeliveryMin: 1200 }),       ipAddress: "103.48.26.11", createdAt: new Date(Date.now() - 3600000 * 36).toISOString() },
];

// ─── Format helpers ───────────────────────────────────────────────────────────

const MODULE_MAP: Record<string, string> = {
  PRICING_TAX: "Pricing & Tax", PAYOUTS: "Payouts",
  ROLE_MANAGEMENT: "Role Management", FEATURE_FLAGS: "Feature Flags",
  SYSTEM_SETTINGS: "System Settings", USER_MANAGEMENT: "User Management",
  BRANCH_OPS: "Branch Operations", VENDOR_OPS: "Vendor Operations", AUTH: "Authentication",
};
const ACTION_MAP: Record<string, string> = {
  UPDATE_TAX_RATE: "Updated Tax Rate", APPROVE_VENDOR_PAYOUT: "Approved Vendor Payout",
  ELEVATE_USER_ROLE: "Elevated User Role", TOGGLE_EXPRESS_DELIVERY: "Toggled Express Delivery",
  UPDATE_DELIVERY_CHARGES: "Updated Delivery Charges", CREATE_BRANCH: "Created Branch",
  BLOCK_USER: "Blocked User", UPDATE_SETTING: "Updated Setting",
};
const KEY_MAP: Record<string, string> = {
  vatPercentage: "VAT %", expressSurcharge: "Express Surcharge", payoutId: "Payout Ref",
  status: "Status", amount: "Amount", userId: "User Ref", role: "Role",
  feature: "Feature", isEnabled: "Enabled", baseDeliveryFee: "Base Fee", freeDeliveryMin: "Free Delivery Min",
};

function fmtModule(s: string) { return MODULE_MAP[s?.toUpperCase()] ?? s?.toLowerCase().replace(/_/g," ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function fmtAction(s: string) { return ACTION_MAP[s?.toUpperCase()] ?? s?.toLowerCase().replace(/_/g," ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function fmtKey(k: string)    { return KEY_MAP[k] ?? k.replace(/([A-Z])/g," $1").replace(/\b\w/g,(c)=>c.toUpperCase()); }
function fmtVal(k: string, v: any): string {
  if (v == null) return "None";
  if (typeof v === "boolean") return v ? "Enabled" : "Disabled";
  if (k.match(/fee|amount|surcharge|min/i) && typeof v === "number") return `৳${v.toLocaleString()}`;
  if (k.match(/vat|percentage/i)) return `${v}%`;
  return String(v);
}
function parseJson(s?: string | null): { key: string; label: string; value: string }[] {
  if (!s) return [];
  try {
    const obj = JSON.parse(s);
    if (typeof obj !== "object" || !obj) return [];
    return Object.entries(obj).map(([k, v]) => ({ key: k, label: fmtKey(k), value: fmtVal(k, v) }));
  } catch { return [{ key: "v", label: "Raw Value", value: String(s) }]; }
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
        {[0,1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Sk className="h-3 w-20" />
            <Sk className="h-3 flex-1" />
            <div className="flex items-center gap-2"><Sk className="h-5 w-24 rounded-full" /><Sk className="h-3 w-32" /></div>
            <Sk className="h-3 w-24" />
            <Sk className="h-3 w-28" />
            <Sk className="h-8 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [logs,         setLogs]         = useState<AuditLogItem[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [selectedLog,  setSelectedLog]  = useState<AuditLogItem | null>(null);

  const fetchLogs = () => {
    setRefreshing(true);
    authFetch("/audit-logs?page=1&limit=100")
      .then((r) => r.json())
      .then((json) => setLogs(json.success && json.data?.length ? json.data : FALLBACK))
      .catch(() => setLogs(FALLBACK))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };
  useEffect(() => { fetchLogs(); }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const availableModules = useMemo(() => {
    const mods = new Set(logs.map((l) => l.module.toUpperCase()));
    return ["ALL", ...Array.from(mods)];
  }, [logs]);

  const uniqueIPs    = useMemo(() => new Set(logs.map((l) => l.ipAddress).filter(Boolean)).size, [logs]);
  const totalModules = availableModules.length - 1;

  const displayed = useMemo(() => logs.filter((log) => {
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      log.id.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      fmtAction(log.action).toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      fmtModule(log.module).toLowerCase().includes(q) ||
      log.performedBy.toLowerCase().includes(q) ||
      (log.ipAddress?.toLowerCase().includes(q) ?? false);
    const matchModule = moduleFilter === "ALL" || log.module.toUpperCase() === moduleFilter;
    return matchSearch && matchModule;
  }), [logs, search, moduleFilter]);

  const hasFilters   = !!(search.trim() || moduleFilter !== "ALL");
  const clearFilters = () => { setSearch(""); setModuleFilter("ALL"); };

  // ── Dialog entries ─────────────────────────────────────────────────────────
  const oldEntries = useMemo(() => parseJson(selectedLog?.oldValue), [selectedLog?.oldValue]);
  const newEntries = useMemo(() => parseJson(selectedLog?.newValue), [selectedLog?.newValue]);

  return (
    <div className="space-y-6">

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Super Admin — Security Ledger"
        title="System Audit Logs"
        description="Immutable recorded timeline of admin overrides, pricing updates, role changes, payout approvals, and all security events."
        icon={Activity}
        liveLabel="Immutable Ledger"
        chips={[
          { label: "Total Events",  value: loading ? "—" : String(logs.length),   sub: "All recorded actions"   },
          { label: "Modules",       value: loading ? "—" : String(totalModules),   sub: "System areas covered"  },
          { label: "Unique IPs",    value: loading ? "—" : String(uniqueIPs),      sub: "Source addresses"       },
        ]}
      />

      {/* ── 2. Stat cards ───────────────────────────────────────────────── */}
      {!loading && (
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <OverviewStatCard title="Total Events"   value={logs.length}          icon={Activity}      gradient="from-violet-500 to-purple-600" />
          <OverviewStatCard title="System Modules" value={totalModules}          icon={Sliders}       gradient="from-primary to-indigo-700"    />
          <OverviewStatCard title="Secured Ledger" value="100% Active"           icon={Shield}        gradient="from-emerald-500 to-teal-600"  />
          <OverviewStatCard title="Unique IPs"     value={uniqueIPs || 1}        icon={Globe}         gradient="from-sky-500 to-cyan-600"      />
        </motion.div>
      )}

      {/* ── 3. Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        {/* Module filter pills */}
        <div className="flex items-center gap-1 rounded-2xl border border-border bg-muted p-1.5 overflow-x-auto scrollbar-none">
          {availableModules.map((mod) => {
            const isActive = moduleFilter === mod;
            return (
              <button key={mod} onClick={() => setModuleFilter(mod)}
                className={["flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black whitespace-nowrap select-none transition-all duration-150",
                  isActive ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground hover:bg-card/60"].join(" ")}>
                {mod === "ALL" ? "All Modules" : fmtModule(mod)}
              </button>
            );
          })}
        </div>

        {/* Right — search + clear + refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input type="text" placeholder="Search action, module, IP…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-64 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
          </div>
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}
              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1 px-2.5">
              <RotateCcw size={12} /> Clear
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={fetchLogs} className="h-8 rounded-xl text-xs font-bold gap-1.5">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* ── 4. Table ────────────────────────────────────────────────────── */}
      {loading ? <TableSkeleton /> : (
        <OpsTable
          animateKey={moduleFilter + search}
          keyExtractor={(l) => l.id}
          displayed={displayed}
          totalCount={logs.length}
          noun="events"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          emptyTitle="No audit log entries found"
          emptyFiltered="Try adjusting your search or module filter."
          emptyDefault="No audit events recorded yet."
          footerStats={[
            { icon: <Lock size={11} className="text-muted-foreground" />, label: "Immutable — entries cannot be deleted or modified" },
          ]}
          columns={[
            {
              header: "Event ID", width: "110px",
              render: (l) => (
                <p className="text-[11px] font-black font-mono tabular-nums"
                  style={{ color: "var(--primary)" }}>
                  #{l.id.slice(-8).toUpperCase()}
                </p>
              ),
            },
            {
              header: "Performed By", width: "minmax(160px,2fr)",
              render: (l) => (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
                    bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[11px] font-black
                    shadow-sm transition-transform duration-200 group-hover:scale-110">
                    {(l.performedBy ?? "S").charAt(0).toUpperCase()}
                  </div>
                  <p className="text-[12px] font-bold text-card-foreground truncate group-hover:text-primary transition-colors">
                    {l.performedBy}
                  </p>
                </div>
              ),
            },
            {
              header: "Module & Action", width: "minmax(200px,2fr)",
              render: (l) => (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/8 px-2.5 py-[3px] text-[10px] font-black text-violet-600 dark:text-violet-400 whitespace-nowrap">
                    {fmtModule(l.module)}
                  </span>
                  <span className="text-[12px] font-bold text-card-foreground truncate">
                    {fmtAction(l.action)}
                  </span>
                </div>
              ),
            },
            {
              header: "IP Address", width: "130px",
              render: (l) => (
                <p className="text-[11px] font-mono text-muted-foreground">{l.ipAddress || "127.0.0.1"}</p>
              ),
            },
            {
              header: "Timestamp", width: "160px",
              render: (l) => (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium whitespace-nowrap">
                  <Clock size={11} className="shrink-0" />
                  {new Date(l.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              ),
            },
            {
              header: "Details", width: "120px",
              render: (l) => (
                <Button size="sm" variant="ghost" onClick={() => setSelectedLog(l)}
                  className="h-8 rounded-xl px-2.5 text-[11px] font-black text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1">
                  <Eye size={12} /> View
                </Button>
              ),
            },
          ]}
        />
      )}

      {/* ── 5. Detail Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!selectedLog} onOpenChange={(v) => !v && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl rounded-2xl">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-base font-black text-card-foreground flex items-center gap-2">
                <FileText size={16} className="text-violet-500" />
                Audit Event — #{selectedLog?.id.slice(-8).toUpperCase()}
              </DialogTitle>
              <span className="inline-flex items-center rounded-full border border-violet-500/20 bg-violet-500/8 px-2.5 py-[3px] text-[10px] font-black text-violet-600">
                {selectedLog && fmtModule(selectedLog.module)}
              </span>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Action: <strong className="text-card-foreground">{selectedLog && fmtAction(selectedLog.action)}</strong>
              {" · "}Recorded at {selectedLog && new Date(selectedLog.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2">
              {/* Meta row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Performed By", value: selectedLog.performedBy },
                  { label: "IP Address",   value: selectedLog.ipAddress || "127.0.0.1" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl border border-border bg-muted/50 px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</p>
                    <p className="text-[12px] font-bold text-card-foreground mt-0.5 truncate">{value}</p>
                  </div>
                ))}
              </div>

              {/* Old vs New diff */}
              {(oldEntries.length > 0 || newEntries.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Old values */}
                  <div className="rounded-xl border border-error/20 bg-error/5 p-3 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-error/70">Before</p>
                    {oldEntries.map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                        <span className="text-[11px] font-black text-card-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                  {/* New values */}
                  <div className="rounded-xl border border-success/20 bg-success/5 p-3 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-success/70">After</p>
                    {newEntries.map(({ key, label, value }) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                        <span className="text-[11px] font-black text-card-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}
                  className="rounded-xl text-xs font-bold">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
