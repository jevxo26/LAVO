"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gauge, Package, TrendingUp, Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CapacityData {
  vendorId: string; dailyCapacity: number; usedCapacity: number;
  remainingCapacity: number; maximumCapacity: number;
  utilizationPercent: number; status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { cls: string; dot: string }> = {
  AVAILABLE: { cls: "bg-success/10 text-success border-success/25",   dot: "bg-success"   },
  NEAR_FULL: { cls: "bg-warning/10 text-warning border-warning/25",   dot: "bg-warning"   },
  FULL:      { cls: "bg-error/10 text-error border-error/25",         dot: "bg-error"     },
  NOT_SET:   { cls: "bg-muted text-muted-foreground border-border",   dot: "bg-muted-foreground/50" },
};

function barColor(pct: number): string {
  if (pct >= 100) return "bg-error";
  if (pct >= 80)  return "bg-warning";
  return "bg-primary";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="h-28 rounded-3xl bg-muted" />
      <div className="h-44 rounded-3xl bg-muted" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorCapacityPage() {
  const [data, setData]       = useState<CapacityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [daily, setDaily]     = useState("");
  const [maximum, setMaximum] = useState("");

  const fetchCapacity = async () => {
    setLoading(true);
    try {
      const res  = await authFetch("/vendor-dashboard/capacity");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setDaily(String(json.data.dailyCapacity));
        setMaximum(String(json.data.maximumCapacity));
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCapacity(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await authFetch("/vendor-dashboard/capacity", {
        method: "PATCH",
        body: JSON.stringify({
          dailyCapacity:   parseInt(daily),
          maximumCapacity: parseInt(maximum),
        }),
      });
      const json = await res.json();
      if (json.success) { toast.success("Capacity updated"); fetchCapacity(); }
      else toast.error(json.message ?? "Failed to update capacity");
    } finally { setSaving(false); }
  };

  if (loading) return <PageSkeleton />;

  const pct    = data?.utilizationPercent ?? 0;
  const status = data?.status ?? "NOT_SET";
  const sm     = STATUS_META[status] ?? STATUS_META.NOT_SET;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Dashboard"
        title="Capacity Management"
        description="Set your daily processing capacity and monitor utilization in real time."
        icon={Gauge}
        chips={data ? [
          { label: "Utilization", value: `${pct}%` },
          { label: "Remaining",   value: data.remainingCapacity },
        ] : []}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewStatCard label="Daily Capacity" sub="Processing limit"  value={data?.dailyCapacity   ?? 0} icon={Layers}    gradient="from-indigo-500 to-violet-600" />
        <OverviewStatCard label="Used Today"     sub="Orders processed"  value={data?.usedCapacity    ?? 0} icon={Package}   gradient="from-amber-400 to-orange-500"  />
        <OverviewStatCard label="Remaining"      sub="Slots available"   value={data?.remainingCapacity ?? 0} icon={TrendingUp} gradient="from-emerald-500 to-teal-600" />
        <OverviewStatCard label="Max Capacity"   sub="Hard upper limit"  value={data?.maximumCapacity ?? 0} icon={Gauge}     gradient="from-violet-500 to-purple-600" />
      </div>

      {/* ── 3. Utilization Bar ───────────────────────────────────────────────── */}
      {data && (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <Gauge size={17} />
              </div>
              <div>
                <h2 className="text-sm font-black text-card-foreground">Capacity Utilization</h2>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {data.usedCapacity} of {data.dailyCapacity} slots used today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${sm.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                {status.replace("_", " ")}
              </span>
              <span className="text-2xl font-black text-card-foreground">{pct}%</span>
            </div>
          </div>

          <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={`h-full rounded-full ${barColor(pct)}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>

          {pct >= 80 && (
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-warning/10 border border-warning/25 px-4 py-3">
              <AlertCircle size={15} className="text-warning shrink-0" />
              <p className="text-xs font-bold text-warning">
                Approaching capacity limit — consider updating your daily limit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 4. Update Form ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
            style={{ color: "var(--primary)" }}>
            <Gauge size={17} />
          </div>
          <div>
            <h2 className="text-sm font-black text-card-foreground">Update Capacity Settings</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Adjust your daily and maximum processing limits</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 max-w-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Daily Capacity</Label>
              <Input
                type="number" min={0}
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                className="rounded-2xl h-11 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-black text-card-foreground">Maximum Capacity</Label>
              <Input
                type="number" min={0}
                value={maximum}
                onChange={(e) => setMaximum(e.target.value)}
                className="rounded-2xl h-11 text-xs"
              />
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="mt-5 rounded-2xl text-white font-black px-6 h-11"
            style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
