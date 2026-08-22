"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Save, Loader2, Percent, Wallet } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinancialRulesData {
  vendorCommissionRate: number;
  minPayoutThreshold:   number;
}

interface FinancialRulesFormProps {
  initialData?: FinancialRulesData;
  onSave?:      (data: FinancialRulesData) => Promise<void>;
}

// ─── Field config ─────────────────────────────────────────────────────────────

const FIELDS = [
  {
    key:     "vendorCommissionRate" as const,
    label:   "Default Vendor Commission Rate",
    sub:     "Percentage retained by Laundrix on each vendor-fulfilled order",
    unit:    "% percent",
    icon:    Percent,
    gradient:"from-violet-500 to-purple-600",
    min: 0, max: 100, step: 0.1,
  },
  {
    key:     "minPayoutThreshold" as const,
    label:   "Minimum Payout Threshold",
    sub:     "Minimum wallet balance required for vendors to initiate a payout request",
    unit:    "৳ BDT",
    icon:    Wallet,
    gradient:"from-emerald-500 to-teal-600",
    min: 100, max: undefined, step: 50,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const FinancialRulesForm: React.FC<FinancialRulesFormProps> = ({ initialData, onSave }) => {
  const [values, setValues] = useState<FinancialRulesData>({
    vendorCommissionRate: initialData?.vendorCommissionRate ?? 15,
    minPayoutThreshold:   initialData?.minPayoutThreshold   ?? 1000,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) setValues(initialData);
  }, [initialData]);

  const handleChange = (key: keyof FinancialRulesData, raw: string) => {
    setValues((p) => ({ ...p, [key]: parseFloat(raw) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: FinancialRulesData = {
        vendorCommissionRate: Number(values.vendorCommissionRate),
        minPayoutThreshold:   Number(values.minPayoutThreshold),
      };
      if (onSave) {
        await onSave(payload);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res   = await fetch("/api/system-settings/financial-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to update financial rules");
      }
      toast.success("Financial Rules configuration saved successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save financial rules");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Field cards ───────────────────────────────────────────────── */}
      {FIELDS.map(({ key, label, sub, unit, icon: Icon, gradient, min, max, step }) => (
        <div key={key}
          className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/10`}>
              <Icon size={18} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-black text-card-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <input type="number" min={min} max={max} step={step}
              value={values[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              required
              className="w-28 h-10 rounded-xl border border-border bg-muted px-3 text-sm font-black text-card-foreground tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{unit}</span>
          </div>
        </div>
      ))}

      {/* ── Save button ───────────────────────────────────────────────── */}
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-md disabled:opacity-50">
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Financial Rules
        </button>
      </div>
    </form>
  );
};
