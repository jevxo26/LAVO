"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CircleDollarSign, Lock, Loader2 } from "lucide-react";
import { PricingTaxForm, PricingTaxData } from "@/components/settings/PricingTaxForm";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";

export default function PricingTaxSettingsPage() {
  const [data,      setData]      = useState<PricingTaxData>({ baseDeliveryFee: 50, expressMultiplier: 1.5, globalTaxPercentage: 15 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch("/api/system-settings/pricing-tax", { headers });
      const json = await res.json();
      if (res.ok && json.success) setData(json.data);
      else toast.error(json.message || "Failed to load settings");
    } catch { toast.error("Network error"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="w-full space-y-6">
      <DashboardPageHero
        badge="System Settings — Super Admin"
        title="Pricing & Global Tax"
        description="Configure platform-wide VAT rates, express delivery multipliers, and base delivery fees."
        icon={CircleDollarSign}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Base Fee",  value: isLoading ? "—" : `৳${data.baseDeliveryFee}`,        sub: "Per order"          },
          { label: "Express ×", value: isLoading ? "—" : `${data.expressMultiplier}×`,        sub: "Express multiplier" },
          { label: "VAT Rate",  value: isLoading ? "—" : `${data.globalTaxPercentage}%`,      sub: "Global tax"         },
        ]}
      />
      <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
        <Lock size={14} className="text-warning shrink-0" />
        <p className="text-xs font-bold text-card-foreground">Super Admin Strict Access — Changes apply to all future orders platform-wide.</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 gap-3 text-muted-foreground">
          <Loader2 size={22} className="animate-spin text-primary" /><span className="text-sm font-semibold">Loading configuration…</span>
        </div>
      ) : <PricingTaxForm initialData={data} />}
    </div>
  );
}
