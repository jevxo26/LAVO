"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { PackageCheck, RefreshCw, AlertTriangle, Clock } from "lucide-react";

export default function VendorProcessingStatusPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/vendor-ops/processing-status");
      setBatches(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <PackageCheck className="text-blue-600" />
            Vendor Processing Status & Batches
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track outsourced garment batch stages, dry-cleaning cycles, and completion ETAs.
          </p>
        </div>
        <button
          onClick={fetchBatches}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Batches
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Batch ID & Vendor</th>
                <th className="py-3.5 px-6">Garment Type</th>
                <th className="py-3.5 px-6">Quantity</th>
                <th className="py-3.5 px-6">Current Stage</th>
                <th className="py-3.5 px-6">Progress</th>
                <th className="py-3.5 px-6">ETA</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{b.vendorName}</p>
                    <p className="text-xs text-blue-600 font-semibold">{b.batchId}</p>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{b.itemType}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{b.quantity} Pcs</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-800">
                      {b.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${b.progressPercentage}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{b.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Clock size={12} /> {b.estimatedCompletion}
                  </td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        b.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : b.status === "NEAR_COMPLETION"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
