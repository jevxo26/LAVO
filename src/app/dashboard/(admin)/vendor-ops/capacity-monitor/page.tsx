"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Store, Gauge, RefreshCw, Star } from "lucide-react";

export default function VendorCapacityMonitorPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/vendor-ops/capacity-monitor").then(r => r.json());
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Store className="text-blue-600" />
            Vendor Ops Capacity Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor partner laundry vendor load, service specializations, and daily capacity limits.
          </p>
        </div>
        <button
          onClick={fetchVendors}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {vendors.map((v) => (
          <div key={v.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{v.vendorName}</h3>
                <p className="text-xs text-slate-500">{v.serviceFocus}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Star size={12} className="fill-amber-500" /> {v.rating}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Active Load: {v.activeLoadKg} Kg</span>
                <span className="text-slate-900">{v.loadPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    v.loadPercentage > 90
                      ? "bg-red-500"
                      : v.loadPercentage > 70
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${v.loadPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600 font-medium">
              <span>Daily Limit: {v.dailyCapacityKg} Kg</span>
              <span>{v.assignedOrders} Orders</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
