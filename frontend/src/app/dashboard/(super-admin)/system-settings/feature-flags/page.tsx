"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sliders, Lock, Loader2 } from "lucide-react";
import { FeatureFlagsForm, FeatureFlagState } from "@/components/settings/FeatureFlagsForm";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";

export default function FeatureFlagsPage() {
  const [data,      setData]      = useState<FeatureFlagState>({ enableWalletSystem: true, enablePromoCodes: true, enableVendorMarketplace: true, enableLiveAgentTracking: true, enableSMSNotifications: true });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch("/api/system-settings/feature-flags", { headers });
      const json = await res.json();
      if (res.ok && json.success) setData(json.data);
      else toast.error(json.message || "Failed to load feature flags");
    } catch { toast.error("Network error"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const enabledCount  = Object.values(data).filter(Boolean).length;
  const disabledCount = Object.values(data).length - enabledCount;

  return (
    <div className="w-full space-y-6">
      <DashboardPageHero
        badge="System Settings — Super Admin"
        title="Feature Flags & Module Toggles"
        description="Enable or disable platform modules dynamically without redeploying. Changes take effect immediately."
        icon={Sliders}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Total Flags", value: isLoading ? "—" : String(Object.keys(data).length), sub: "Platform modules" },
          { label: "Enabled",     value: isLoading ? "—" : String(enabledCount),              sub: "Active"          },
          { label: "Disabled",    value: isLoading ? "—" : String(disabledCount),             sub: "Inactive"        },
        ]}
      />
      <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
        <Lock size={14} className="text-warning shrink-0" />
        <p className="text-xs font-bold text-card-foreground">Super Admin Strict Access — Feature toggles affect all users platform-wide instantly.</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 gap-3 text-muted-foreground">
          <Loader2 size={22} className="animate-spin text-primary" /><span className="text-sm font-semibold">Loading feature flags…</span>
        </div>
      ) : <FeatureFlagsForm initialFlags={data} />}
    </div>
  );
}
