"use client";

import React, { useState, useEffect } from "react";
import { Sliders, Save, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export interface FeatureFlagState {
  enableWalletSystem: boolean;
  enablePromoCodes: boolean;
  enableVendorMarketplace: boolean;
  enableLiveAgentTracking: boolean;
  enableSMSNotifications: boolean;
}

interface FeatureFlagsFormProps {
  initialFlags?: Partial<FeatureFlagState>;
  onSave?: (flags: FeatureFlagState) => Promise<void>;
}

export const FeatureFlagsForm: React.FC<FeatureFlagsFormProps> = ({ initialFlags, onSave }) => {
  const [flags, setFlags] = useState<FeatureFlagState>({
    enableWalletSystem: initialFlags?.enableWalletSystem ?? true,
    enablePromoCodes: initialFlags?.enablePromoCodes ?? true,
    enableVendorMarketplace: initialFlags?.enableVendorMarketplace ?? true,
    enableLiveAgentTracking: initialFlags?.enableLiveAgentTracking ?? true,
    enableSMSNotifications: initialFlags?.enableSMSNotifications ?? true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialFlags) {
      setFlags({
        enableWalletSystem: initialFlags.enableWalletSystem ?? true,
        enablePromoCodes: initialFlags.enablePromoCodes ?? true,
        enableVendorMarketplace: initialFlags.enableVendorMarketplace ?? true,
        enableLiveAgentTracking: initialFlags.enableLiveAgentTracking ?? true,
        enableSMSNotifications: initialFlags.enableSMSNotifications ?? true,
      });
    }
  }, [initialFlags]);

  const toggleFlag = (key: keyof FeatureFlagState) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(flags);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res = await fetch("/api/system-settings/feature-flags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(flags),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to update feature flags");
      }
      toast.success("Feature Flags & Module Toggles updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update feature flags");
    } finally {
      setIsLoading(false);
    }
  };

  const flagList = [
    { key: "enableWalletSystem" as const, title: "Wallet & Cash System", desc: "Enable customer digital wallet top-up, refunds, and cashback balance." },
    { key: "enablePromoCodes" as const, title: "Promo Codes & Vouchers", desc: "Allow customers to apply discount coupons during order checkout." },
    { key: "enableVendorMarketplace" as const, title: "Vendor Partner Marketplace", desc: "Enable third-party vendor laundry listings and order assignment." },
    { key: "enableLiveAgentTracking" as const, title: "Live Agent GPS Tracking", desc: "Show real-time delivery agent location on tracking screens." },
    { key: "enableSMSNotifications" as const, title: "SMS Gateway Alerts", desc: "Send automated SMS alerts for pickup & delivery dispatch." },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 w-full">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="text-blue-600" size={20} /> System Module Feature Flags
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dynamically enable or disable major platform modules without redeploying code.</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {flagList.map((item) => {
          const isEnabled = flags[item.key];
          return (
            <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isEnabled
                    ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {isEnabled ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                <span>{isEnabled ? "ENABLED" : "DISABLED"}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save Feature Flags</span>
        </button>
      </div>
    </div>
  );
};
