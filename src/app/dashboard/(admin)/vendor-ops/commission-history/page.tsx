"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Banknote, RefreshCw, CircleDollarSign } from "lucide-react";

export default function VendorCommissionHistoryPage() {
  const [comms, setComms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComms = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/vendor-ops/commission-history").then(r => r.json());
      setComms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComms();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="text-blue-600" />
            Vendor Commission & Fee Settlement History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Historical audit of marketplace platform cut, commission percentages, and net vendor payouts.
          </p>
        </div>
        <button
          onClick={fetchComms}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh History
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Vendor Name</th>
                <th className="py-3.5 px-6">Billing Cycle</th>
                <th className="py-3.5 px-6">Gross Volume</th>
                <th className="py-3.5 px-6">Commission Rate</th>
                <th className="py-3.5 px-6">Platform Cut</th>
                <th className="py-3.5 px-6">Vendor Payout</th>
                <th className="py-3.5 px-6">Payout Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comms.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{c.vendorName}</td>
                  <td className="py-4 px-6 font-medium text-slate-600">{c.monthYear}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">৳ {c.grossOrderVolume}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
                      {c.platformFeeRate}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-600">৳ {c.commissionEarned}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">৳ {c.netPayoutToVendor}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        c.payoutStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {c.payoutStatus}
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
