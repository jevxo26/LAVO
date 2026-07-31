"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Banknote, CheckCircle, XCircle, RefreshCw, Lock } from "lucide-react";
import { toast } from "sonner";

export default function PayoutApprovalsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/payout-approvals").then(r => r.json());
      setPayouts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleAction = async (payoutId: string, action: "APPROVE" | "REJECT") => {
    try {
      await authFetch("/payout-approvals", { method: "POST", body: JSON.stringify({ payoutId, action }) }).then(r => r.json());
      toast.success(`Payout ${payoutId} ${action === "APPROVE" ? "Approved" : "Rejected"}`);
      fetchPayouts();
    } catch (err) {
      toast.error("Failed to process payout decision");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="text-emerald-600" />
            Vendor Payout Request Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Super Admin approval gateway for marketplace vendor bank transfers and withdrawals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <Lock size={14} /> Super Admin Control
          </span>
          <button
            onClick={fetchPayouts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Payouts
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Payout Ref</th>
                <th className="py-3.5 px-6">Vendor</th>
                <th className="py-3.5 px-6">Bank Account Details</th>
                <th className="py-3.5 px-6">Net Payout Amount</th>
                <th className="py-3.5 px-6">Requested Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{p.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{p.vendorName}</td>
                  <td className="py-4 px-6 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{p.bankName}</p>
                    <p className="text-slate-400 font-mono">{p.accountNumber}</p>
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-600 text-base">৳ {p.requestedAmount}</td>
                  <td className="py-4 px-6 text-xs text-slate-500">{p.requestedAt}</td>
                  <td className="py-4 px-6 text-xs">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold ${
                        p.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {p.status === "PENDING_APPROVAL" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(p.id, "APPROVE")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <CheckCircle size={14} /> Approve Payout
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "REJECT")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg text-xs hover:bg-red-100 transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">Processed</span>
                    )}
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
