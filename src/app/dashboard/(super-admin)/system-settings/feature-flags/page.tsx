"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Lock, Loader2 } from "lucide-react";
import { FeatureFlagsForm, FeatureFlagState } from "@/components/settings/FeatureFlagsForm";
import { toast } from "sonner";

export default function FeatureFlagsPage() {
  const [data, setData] = useState<FeatureFlagState>({
    enableWalletSystem: true,
    enablePromoCodes: true,
    enableVendorMarketplace: true,
    enableLiveAgentTracking: true,
    enableSMSNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/system-settings/feature-flags", { headers });
      const json = await res.json();

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || "Failed to load feature flags");
      }
    } catch {
      toast.error("Network error while loading feature flags");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="text-blue-600" />
            System Feature Flags & Module Toggles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enable or disable platform modules dynamically without redeploying code.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900 w-fit">
          <Lock size={14} /> SUPER_ADMIN STRICT ACCESS
        </span>
      </div>

      {isLoading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-3 text-slate-500 font-semibold">
            <Loader2 size={24} className="animate-spin text-blue-600" /> Loading feature flags...
          </div>
        </div>
      ) : (
        <FeatureFlagsForm initialFlags={data} />
      )}
    </div>
  );
}
