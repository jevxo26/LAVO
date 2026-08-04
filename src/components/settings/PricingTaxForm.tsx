"use client";

import React, { useState, useEffect } from "react";
import { CircleDollarSign, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface PricingTaxData {
  baseDeliveryFee: number;
  expressMultiplier: number;
  globalTaxPercentage: number;
}

interface PricingTaxFormProps {
  initialData?: PricingTaxData;
  onSave?: (data: PricingTaxData) => Promise<void>;
}

export const PricingTaxForm: React.FC<PricingTaxFormProps> = ({ initialData, onSave }) => {
  const [baseFee, setBaseFee] = useState<number>(initialData?.baseDeliveryFee ?? 50);
  const [expressMult, setExpressMult] = useState<number>(initialData?.expressMultiplier ?? 1.5);
  const [taxPercent, setTaxPercent] = useState<number>(initialData?.globalTaxPercentage ?? 15);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setBaseFee(initialData.baseDeliveryFee ?? 50);
      setExpressMult(initialData.expressMultiplier ?? 1.5);
      setTaxPercent(initialData.globalTaxPercentage ?? 15);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: PricingTaxData = {
        baseDeliveryFee: Number(baseFee),
        expressMultiplier: Number(expressMult),
        globalTaxPercentage: Number(taxPercent),
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res = await fetch("/api/system-settings/pricing-tax", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to update pricing & tax settings");
      }
      toast.success("Pricing & Global Tax Configuration updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update pricing & tax settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CircleDollarSign className="text-blue-600" size={20} /> Pricing & Tax Rules
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set platform-wide delivery pricing rates and global VAT tax rates.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Base Delivery Fee (BDT ৳)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={baseFee}
            onChange={(e) => setBaseFee(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Express Delivery Multiplier (e.g. 1.5 = 150%)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={expressMult}
            onChange={(e) => setExpressMult(parseFloat(e.target.value) || 1)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Global Tax Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save Pricing & Tax</span>
        </button>
      </div>
    </form>
  );
};
