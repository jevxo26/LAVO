"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Gauge, RefreshCw, AlertTriangle } from "lucide-react";

export default function BranchCapacityMonitorPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCapacity = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/branch-ops/capacity-monitor");
      setBranches(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapacity();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-blue-600" />
            Branch Ops Capacity Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time wash capacity, garment load distribution, and hub congestion control.
          </p>
        </div>
        <button
          onClick={fetchCapacity}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Load
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {branches.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{b.name}</h3>
                <p className="text-xs text-slate-500">{b.location}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  b.loadPercentage > 90
                    ? "bg-red-100 text-red-700"
                    : b.loadPercentage > 75
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {b.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Current Load: {b.currentLoadKg} Kg</span>
                <span className="text-slate-900">{b.loadPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.loadPercentage > 90
                      ? "bg-red-500"
                      : b.loadPercentage > 75
                      ? "bg-amber-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${b.loadPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600 font-medium">
              <span>Max: {b.capacityKg} Kg/day</span>
              <span>{b.activeOrders} Active Orders</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
