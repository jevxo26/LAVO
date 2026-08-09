"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, ToggleLeft, ToggleRight,
  Wallet, Tag, Store, Navigation, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeatureFlagState {
  enableWalletSystem:      boolean;
  enablePromoCodes:        boolean;
  enableVendorMarketplace: boolean;
  enableLiveAgentTracking: boolean;
  enableSMSNotifications:  boolean;
}

interface FeatureFlagsFormProps {
  initialFlags?: Partial<FeatureFlagState>;
  onSave?:       (flags: FeatureFlagState) => Promise<void>;
}

// ─── Flag config ──────────────────────────────────────────────────────────────

const FLAG_LIST = [
  { key: "enableWalletSystem"      as const, title: "Wallet & Cash System",       desc: "Customer digital wallet top-up, refunds, and cashback balance.", icon: Wallet,      gradient: "from-emerald-500 to-teal-600"   },
  { key: "enablePromoCodes"        as const, title: "Promo Codes & Vouchers",     desc: "Allow customers to apply discount coupons at checkout.",         icon: Tag,         gradient: "from-violet-500 to-purple-600"  },
  { key: "enableVendorMarketplace" as const, title: "Vendor Partner Marketplace", desc: "Third-party vendor laundry listings and order assignment.",       icon: Store,       gradient: "from-primary to-indigo-700"     },
  { key: "enableLiveAgentTracking" as const, title: "Live Agent GPS Tracking",    desc: "Real-time delivery agent location on customer tracking screens.", icon: Navigation,  gradient: "from-sky-500 to-cyan-600"       },
  { key: "enableSMSNotifications"  as const, title: "SMS Gateway Alerts",         desc: "Automated SMS notifications for pickup & delivery dispatch.",     icon: MessageSquare,gradient: "from-amber-400 to-orange-500" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const FeatureFlagsForm: React.FC<FeatureFlagsFormProps> = ({ initialFlags, onSave }) => {
  const [flags, setFlags] = useState<FeatureFlagState>({
    enableWalletSystem:      initialFlags?.enableWalletSystem      ?? true,
    enablePromoCodes:        initialFlags?.enablePromoCodes        ?? true,
    enableVendorMarketplace: initialFlags?.enableVendorMarketplace ?? true,
    enableLiveAgentTracking: initialFlags?.enableLiveAgentTracking ?? true,
    enableSMSNotifications:  initialFlags?.enableSMSNotifications  ?? true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialFlags) {
      setFlags({
        enableWalletSystem:      initialFlags.enableWalletSystem      ?? true,
        enablePromoCodes:        initialFlags.enablePromoCodes        ?? true,
        enableVendorMarketplace: initialFlags.enableVendorMarketplace ?? true,
        enableLiveAgentTracking: initialFlags.enableLiveAgentTracking ?? true,
        enableSMSNotifications:  initialFlags.enableSMSNotifications  ?? true,
      });
    }
  }, [initialFlags]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(flags);
      } else {
        const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null;
        const res   = await fetch("/api/system-settings/feature-flags", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
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

  return (
    <div className="space-y-4">
      {/* ── Flag cards ──────────────────────────────────────────────────── */}
      {FLAG_LIST.map(({ key, title, desc, icon: Icon, gradient }) => {
        const isEnabled = flags[key];
        return (
          <div key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:border-ring/40">
            {/* Icon + text */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/10`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-card-foreground">{title}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>

            {/* Toggle button */}
            <button
              type="button"
              onClick={() => setFlags((p) => ({ ...p, [key]: !p[key] }))}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black",
                "border transition-all duration-200 hover:scale-[1.02] shrink-0",
                isEnabled
                  ? "bg-success/10 text-success border-success/25 dark:bg-success/15 dark:border-success/30"
                  : "bg-muted text-muted-foreground border-border",
              ].join(" ")}
            >
              {isEnabled
                ? <ToggleRight size={17} className="text-success" />
                : <ToggleLeft  size={17} />}
              {isEnabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>
        );
      })}

      {/* ── Save button ─────────────────────────────────────────────────── */}
      <div className="flex justify-end pt-1">
        <button type="button" onClick={handleSave} disabled={isLoading}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-md disabled:opacity-50">
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Feature Flags
        </button>
      </div>
    </div>
  );
};
