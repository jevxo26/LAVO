"use client";

import React, { useState } from "react";
import { Truck, Save, Lock, Zap, Gift } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { toast } from "sonner";

const FIELDS = [
  { key: "expressFee",    label: "Express Delivery Fee",           sub: "Same-day express surcharge per order",       unit: "৳ BDT", icon: Zap,   gradient: "from-amber-400 to-orange-500",  defaultVal: "60"  },
  { key: "standardFee",  label: "Standard Pickup & Delivery Fee", sub: "Flat fee for standard pickup and delivery",  unit: "৳ BDT", icon: Truck, gradient: "from-primary to-indigo-700",    defaultVal: "30"  },
  { key: "freeThreshold",label: "Free Delivery Threshold",        sub: "Orders above this amount get free delivery", unit: "৳ BDT", icon: Gift,  gradient: "from-emerald-500 to-teal-600",  defaultVal: "500" },
];

export default function DeliveryChargesSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({ expressFee: "60", standardFee: "30", freeThreshold: "500" });

  return (
    <div className="space-y-6">
      <DashboardPageHero
        badge="System Settings — Super Admin"
        title="Delivery & Logistics Fees"
        description="Set express delivery surcharges, standard pickup fees, and free delivery order thresholds."
        icon={Truck}
        liveLabel="Super Admin Only"
        chips={[
          { label: "Express Fee",    value: `৳${values.expressFee}`,    sub: "Per express order"    },
          { label: "Standard Fee",   value: `৳${values.standardFee}`,   sub: "Per standard order"   },
          { label: "Free Threshold", value: `৳${values.freeThreshold}`, sub: "Min for free delivery" },
        ]}
      />
      <div className="flex items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/8 px-4 py-3">
        <Lock size={14} className="text-warning shrink-0" />
        <p className="text-xs font-bold text-card-foreground">Super Admin Only — Delivery fee changes apply to all new orders immediately.</p>
      </div>
      <div className="space-y-4">
        {FIELDS.map(({ key, label, sub, unit, icon: Icon, gradient }) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/10`}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-black text-card-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input type="number" value={values[key]}
                onChange={(e) => setValues((p) => ({ ...p, [key]: e.target.value }))}
                className="w-28 h-10 rounded-xl border border-border bg-muted px-3 text-sm font-black text-card-foreground tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition" />
              <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={() => toast.success("Delivery Charges updated!")}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-xs font-black text-white bg-gradient-to-br from-primary to-indigo-700 hover:opacity-90 transition-all hover:scale-[1.02] shadow-md">
          <Save size={14} /> Save Delivery Rules
        </button>
      </div>
    </div>
  );
}
