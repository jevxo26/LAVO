"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gauge, Package, TrendingUp, Layers, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CapacityData {
  vendorId: string; dailyCapacity: number; usedCapacity: number;
  remainingCapacity: number; maximumCapacity: number;
  utilizationPercent: number; status: string;
}

const STATUS_META: Record<string, { cls: string; dot: string }> = {
  AVAILABLE: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  NEAR_FULL: { cls: "bg-amber-50  text-amber-700  border-amber-200",    dot: "bg-amber-400"   },
  FULL:      { cls: "bg-rose-50   text-rose-700   border-rose-200",     dot: "bg-rose-400"    },
  NOT_SET:   { cls: "bg-slate-50  text-slate-600  border-slate-200",    dot: "bg-slate-400"   },
};

function barColor(pct: number) {
  return pct >= 100 ? "bg-rose-500" : pct >= 80 ? "bg-amber-500" : "bg-indigo-500";
}

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-28 rounded-2xl" />)}</div>
      <Sk className="h-28 rounded-2xl" />
      <Sk className="h-44 rounded-2xl" />
    </div>
  );
}

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
      if (json.success) { setData(json.data); setDaily(String(json.data.dailyCapacity)); setMaximum(String(json.data.maximumCapacity)); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCapacity(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await authFetch("/vendor-dashboard/capacity", { method: "PATCH", body: JSON.stringify({ dailyCapacity: parseInt(daily), maximumCapacity: parseInt(maximum) }) });
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
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-amber-200" />
              <span className="text-amber-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Capacity Management</h1>
            <p className="mt-1 text-sm text-amber-100">Set your daily processing capacity and monitor utilization.</p>
          </div>
          {data && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-wider">Utilization</p>
                <p className="text-white font-extrabold text-xl leading-tight">{pct}%</p>
              </div>
              <div className={`rounded-xl border px-3 py-1.5 flex items-center gap-1.5 ${sm.cls}`}>
                <span className={`h-2 w-2 rounded-full ${sm.dot}`} />
                <span className="text-xs font-bold">{status.replace("_", " ")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Daily Capacity",  sub: "Processing limit",   value: data?.dailyCapacity ?? 0,      Icon: Layers,    iconBg: "bg-indigo-50",  iconColor: "text-indigo-600",  ringColor: "ring-indigo-100",  vColor: "text-slate-900"       },
          { label: "Used Today",      sub: "Orders processed",   value: data?.usedCapacity ?? 0,       Icon: Package,   iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100",   vColor: "text-slate-900"       },
          { label: "Remaining",       sub: "Slots available",    value: data?.remainingCapacity ?? 0,  Icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100", vColor: "text-emerald-600"     },
          { label: "Max Capacity",    sub: "Hard upper limit",   value: data?.maximumCapacity ?? 0,    Icon: Gauge,     iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100",  vColor: "text-slate-900"       },
        ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor, vColor }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className={`text-2xl font-extrabold leading-none ${vColor}`}>{value}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Utilization bar ───────────────────────────────────────────────── */}
      {data && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <Gauge size={14} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Capacity Utilization</h2>
                <p className="text-[11px] text-slate-400">{data.usedCapacity} of {data.dailyCapacity} slots used today</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-slate-900">{pct}%</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          {pct >= 80 && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">Approaching capacity limit — consider updating your daily limit.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Update form ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Gauge size={14} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Update Capacity Settings</h2>
            <p className="text-[11px] text-slate-400">Adjust your daily and maximum processing limits</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 max-w-sm">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Daily Capacity</Label>
              <Input type="number" min={0} value={daily} onChange={(e) => setDaily(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Maximum Capacity</Label>
              <Input type="number" min={0} value={maximum} onChange={(e) => setMaximum(e.target.value)} className="rounded-xl h-11" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="mt-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-11">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
