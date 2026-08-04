"use client";

import React, { useState, useEffect } from "react";
import { Landmark, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface FinancialRulesData {
  vendorCommissionRate: number;
  minPayoutThreshold: number;
}

interface FinancialRulesFormProps {
  initialData?: FinancialRulesData;
  onSave?: (data: FinancialRulesData) => Promise<void>;
}

export const FinancialRulesForm: React.FC<FinancialRulesFormProps> = ({ initialData, onSave }) => {
  const [commissionRate, setCommissionRate] = useState<number>(initialData?.vendorCommissionRate ?? 15);
  const [minPayout, setMinPayout] = useState<number>(initialData?.minPayoutThreshold ?? 1000);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCommissionRate(initialData.vendorCommissionRate ?? 15);
      setMinPayout(initialData.minPayoutThreshold ?? 1000);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload: FinancialRulesData = {
        vendorCommissionRate: Number(commissionRate),
        minPayoutThreshold: Number(minPayout),
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res = await fetch("/api/system-settings/financial-rules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to update financial rules");
      }
      toast.success("Financial Rules configuration saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update financial rules");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Landmark className="text-blue-600" size={20} /> Vendor Financial Governance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure partner commission percentages and payout eligibility limits.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Default Vendor Commission Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={commissionRate}
            onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="text-[11px] text-slate-400 mt-1">Percentage retained by Laundrix on each vendor order.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Minimum Payout Threshold (BDT ৳)
          </label>
          <input
            type="number"
            min="100"
            step="50"
            value={minPayout}
            onChange={(e) => setMinPayout(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="text-[11px] text-slate-400 mt-1">Minimum wallet balance required for vendors to initiate payout requests.</p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save Financial Rules</span>
        </button>
      </div>
    </form>
  );
};
