"use client";

import React, { useState } from "react";
import { CircleDollarSign, Save, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function PricingTaxSettingsPage() {
  const [vat, setVat] = useState("15");
  const [serviceCharge, setServiceCharge] = useState("5");
  const [minOrder, setMinOrder] = useState("150");

  const handleSave = () => {
    toast.success("Pricing & Global Tax Configuration updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CircleDollarSign className="text-blue-600" />
            Pricing & Global Tax Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure VAT rates, service fees, minimum order thresholds, and platform pricing parameters.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <Lock size={14} /> Super Admin Only
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6 max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Government VAT / Tax Rate (%)
            </label>
            <input
              type="number"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Platform Service Charge (%)
            </label>
            <input
              type="number"
              value={serviceCharge}
              onChange={(e) => setServiceCharge(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Minimum Order Value (BDT ৳)
            </label>
            <input
              type="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
