"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Landmark, Lock, Loader2 } from "lucide-react";
import { FinancialRulesForm, FinancialRulesData } from "@/components/settings/FinancialRulesForm";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";

export default function FinancialRulesPage() {
  const [data,      setData]      = useState<FinancialRulesData>({ vendorCommissionRate: 15, minPayoutThreshold: 1000 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res  = await fetch("/api/system-settings/financial-rules", { headers });
      const json = await res.json();
      if (res.ok && json.success) setData(json.data);
      else toast.error(json.message || "Failed to load financial rules");
    } catch { toast.error("Network error"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="w-full space-y-6">
      <DashboardPageHero
        badge="System Settings — Super Admin"
        title="Financial Rules & Vendor Governance"
        description="Set default vendor commission rates and minimum payout thresholds for wallet settlements."
        icon={Landmark}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Commission Rate", value: isLoading ? "—" : `${data.vendorCommissionRate}%`, sub: "Vendor revenue cut"        },
          { label: "Min Payout",      value: isLoading ? "—" : `৳${data.minPayoutThreshold}`,  sub: "Minimum to trigger payout" },
        ]}
      />
      <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
        <Lock size={14} className="text-warning shrink-0" />
        <p className="text-xs font-bold text-card-foreground">Super Admin Strict Access — Financial rules affect all vendor payout calculations platform-wide.</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 gap-3 text-muted-foreground">
          <Loader2 size={22} className="animate-spin text-primary" /><span className="text-sm font-semibold">Loading financial rules…</span>
        </div>
      ) : <FinancialRulesForm initialData={data} />}
    </div>
  );
}
