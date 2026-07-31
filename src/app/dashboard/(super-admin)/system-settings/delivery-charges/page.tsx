"use client";

import React, { useState } from "react";
import { Truck, Save, Lock } from "lucide-react";
import { toast } from "sonner";

export default function DeliveryChargesSettingsPage() {
  const [expressFee, setExpressFee] = useState("60");
  const [standardFee, setStandardFee] = useState("30");
  const [freeThreshold, setFreeThreshold] = useState("500");

  const handleSave = () => {
    toast.success("Delivery Charges & Express Fees updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="text-blue-600" />
            Delivery & Logistics Fee Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Set express delivery surcharges, standard pickup fees, and free delivery thresholds.
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
              Express Delivery Fee (BDT ৳)
            </label>
            <input
              type="number"
              value={expressFee}
              onChange={(e) => setExpressFee(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Standard Pickup & Delivery Fee (BDT ৳)
            </label>
            <input
              type="number"
              value={standardFee}
              onChange={(e) => setStandardFee(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Free Delivery Order Threshold (BDT ৳)
            </label>
            <input
              type="number"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save size={16} /> Save Delivery Rules
          </button>
        </div>
      </div>
    </div>
  );
}
