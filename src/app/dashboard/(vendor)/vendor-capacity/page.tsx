"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Package, TrendingUp, Layers } from "lucide-react";
import { toast } from "sonner";

interface CapacityData {
  vendorId: string;
  dailyCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  maximumCapacity: number;
  utilizationPercent: number;
  status: string;
}

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  NEAR_FULL:  "border-amber-300 bg-amber-50 text-amber-700",
  FULL:       "border-red-300 bg-red-50 text-red-700",
  NOT_SET:    "border-slate-300 bg-slate-50 text-slate-500",
};

export default function VendorCapacityPage() {
  const [data, setData] = useState<CapacityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [daily, setDaily] = useState("");
  const [maximum, setMaximum] = useState("");

  const fetchCapacity = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/vendor-dashboard/capacity");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setDaily(String(json.data.dailyCapacity));
        setMaximum(String(json.data.maximumCapacity));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCapacity(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authFetch("/vendor-dashboard/capacity", {
        method: "PATCH",
        body: JSON.stringify({ dailyCapacity: parseInt(daily), maximumCapacity: parseInt(maximum) }),
      });
      const json = await res.json();
      if (json.success) { toast.success("Capacity updated"); fetchCapacity(); }
      else toast.error(json.message ?? "Failed to update capacity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader title="Capacity Management" description="Set your daily processing capacity and monitor utilization." />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Daily Capacity</CardTitle>
            <Layers className="size-4 text-indigo-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{data?.dailyCapacity ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Used Capacity</CardTitle>
            <Package className="size-4 text-amber-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{data?.usedCapacity ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Remaining</CardTitle>
            <TrendingUp className="size-4 text-emerald-400" />
          </CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{data?.remainingCapacity ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Utilization</CardTitle>
            <Gauge className="size-4 text-violet-400" />
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <div className="text-3xl font-bold">{data?.utilizationPercent ?? 0}%</div>
            {data?.status && (
              <Badge variant="outline" className={STATUS_STYLE[data.status] ?? ""}>
                {data.status.replace("_", " ")}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Utilization bar */}
      {data && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Capacity Utilization</CardTitle></CardHeader>
          <CardContent>
            <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  data.utilizationPercent >= 100 ? "bg-red-500" :
                  data.utilizationPercent >= 80  ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${data.utilizationPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {data.usedCapacity} of {data.dailyCapacity} slots used today
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Update Capacity Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 sm:max-w-sm">
            <div className="space-y-1">
              <Label>Daily Capacity</Label>
              <Input type="number" min={0} value={daily} onChange={(e) => setDaily(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Maximum Capacity</Label>
              <Input type="number" min={0} value={maximum} onChange={(e) => setMaximum(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
