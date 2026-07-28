"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, CheckCircle2, XCircle } from "lucide-react";

export function PayoutRequests() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const res = await axios.get("/api/admin/vendors/payouts");
      setPayouts(res.data.data || []);
    } catch {
      toast.error("Failed to load payout requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handleProcess = async (id: string, status: "PAID" | "REJECTED") => {
    try {
      await axios.put(`/api/admin/vendors/payouts/${id}/process`, { status });
      toast.success(`Payout ${status.toLowerCase()} successfully`);
      fetchPayouts();
    } catch {
      toast.error("Failed to process payout request");
    }
  };

  if (loading) return <div className="text-slate-400 text-sm font-semibold p-6 text-center">Loading payout requests...</div>;

  if (payouts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
        <DollarSign size={48} className="text-slate-200" />
        <span className="text-slate-400 font-bold text-sm">No payout requests registered. All accounts settled!</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-lg">Vendor Payout Clearances</h3>
        <p className="text-slate-400 text-xs mt-0.5">Approve settlements and process wallet balances to partner banks.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase font-bold">
              <th className="p-4">Requested At</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Payment Method</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Clearance Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payouts.map((payout) => (
              <tr key={payout.id} className="text-sm text-slate-600 hover:bg-slate-50/50">
                <td className="p-4 text-xs font-semibold text-slate-400">{new Date(payout.requestedAt).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-slate-700">{payout.vendor?.businessName}</td>
                <td className="p-4 font-bold text-green-600">${payout.amount}</td>
                <td className="p-4 font-semibold text-slate-500">{payout.paymentMethod}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    payout.paymentStatus === "PAID" ? "bg-green-50 text-green-700" :
                    payout.paymentStatus === "REJECTED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                  }`}>{payout.paymentStatus}</span>
                </td>
                <td className="p-4 text-center">
                  {payout.paymentStatus === "PENDING" ? (
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleProcess(payout.id, "REJECTED")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><XCircle size={16} /></button>
                      <button onClick={() => handleProcess(payout.id, "PAID")} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle2 size={16} /></button>
                    </div>
                  ) : (
                    <span className="text-slate-300 text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
