"use client";

import React, { useState } from "react";
import { Settings, Save, Lock, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function FeatureFlagsSettingsPage() {
  const [flags, setFlags] = useState({
    enableVendorMarketplace: true,
    enableLiveAgentTracking: true,
    enableWalletCashback: true,
    enableSMSNotifications: true,
    enableMaintenanceMode: false,
  });

  const toggleFlag = (key: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success("Feature Flags & System Toggles updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600" />
            System Feature Flags & Module Toggles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enable or disable platform modules dynamically without redeploying code.
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
          <Lock size={14} /> Super Admin Only
        </span>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6 max-w-3xl">
        <div className="divide-y divide-slate-100 space-y-4">
          {[
            { key: "enableVendorMarketplace", title: "Vendor Partner Marketplace", desc: "Allow third-party vendors to list services & receive orders" },
            { key: "enableLiveAgentTracking", title: "Live GPS Agent Tracking", desc: "Show real-time delivery agent location on customer tracking screen" },
            { key: "enableWalletCashback", title: "Wallet Cashback Rewards", desc: "Auto-credit bonus wallet funds on qualifying orders" },
            { key: "enableSMSNotifications", title: "SMS Gateway Integration", desc: "Send SMS alerts for pickup & delivery confirmations" },
            { key: "enableMaintenanceMode", title: "Platform Maintenance Mode", desc: "Block new customer bookings while system is undergoing updates" },
          ].map((item) => {
            const isEnabled = flags[item.key as keyof typeof flags];
            return (
              <div key={item.key} className="pt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggleFlag(item.key as keyof typeof flags)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isEnabled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {isEnabled ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                  <span>{isEnabled ? "ENABLED" : "DISABLED"}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Save size={16} /> Save Feature Toggles
          </button>
        </div>
      </div>
    </div>
  );
}
