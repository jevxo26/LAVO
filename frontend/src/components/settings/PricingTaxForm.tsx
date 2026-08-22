"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, Truck, Zap, Percent } from "lucide-react";
import { toast } from "sonner";

export interface PricingTaxData {
  baseDeliveryFee:     number;
  expressMultiplier:   number;
  globalTaxPercentage: number;
}

interface PricingTaxFormProps {
  initialData?: PricingTaxData;
  onSave?:      (data: PricingTaxData) => Promise<void>;
}

const FIELDS = [
  { key: "baseDeliveryFee"     as const, label: "Base Delivery Fee",           sub: "Flat fee applied to every standard order",               unit: "৳ BDT",       icon: Truck,   gradient: "from-primary to-indigo-700",   min: 0,  max: undefined, step: 1   },
  { key: "expressMultiplier"   as const, label: "Express Delivery Multiplier", sub: "Multiplied on base fee for same-day express (1.5 = 150%)",unit: "× multiplier", icon: Zap,     gradient: "from-amber-400 to-orange-500", min: 1,  max: 5,         step: 0.1 },
  { key: "globalTaxPercentage" as const, label: "Global Tax Rate (VAT)",       sub: "Platform-wide VAT applied to all taxable transactions",   unit: "% percent",   icon: Percent, gradient: "from-emerald-500 to-teal-600", min: 0,  max: 100,       step: 0.5 },
];

export const PricingTaxForm: React.FC<PricingTaxFormProps> = ({ initialData, onSave }) => {
  const [values, setValues] = useState<PricingTaxData>({
    baseDeliveryFee:     initialData?.baseDeliveryFee     ?? 50,
    expressMultiplier:   initialData?.expressMultiplier   ?? 1.5,
    globalTaxPercentage: initialData?.globalTaxPercentage ?? 15,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (initialData) setValues(initialData); }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { baseDeliveryFee: Number(values.baseDeliveryFee), expressMultiplier: Number(values.expressMultiplier), globalTaxPercentage: Number(values.globalTaxPercentage) };
      if (onSave) {
        await onSave(payload);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res   = await fetch("/api/system-settings/pricing-tax", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to update");
      }
      toast.success("Pricing & Tax configuration saved!");
    } catch (err: any) { toast.error(err.message || "Failed to save"); }
    finally { setIsLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {FIELDS.map(({ key, label, sub, unit, icon: Icon, gradient, min, max, step }) => (
        <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
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
            <input type="number" min={min} max={max} step={step} value={values[key]} required
              onChange={(e) => setValues((p) => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
              className="w-28 h-10 rounded-xl border border-border bg-muted px-3 text-sm font-black text-card-foreground tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{unit}</span>
          </div>
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={isLoading}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-md disabled:opacity-50">
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Pricing & Tax
        </button>
      </div>
    </form>
  );
};
