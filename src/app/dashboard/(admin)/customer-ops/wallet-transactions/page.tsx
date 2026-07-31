"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Wallet, RefreshCw, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";

export default function WalletTransactionsPage() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxs = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/customer-ops/wallet-transactions").then(r => r.json());
      setTxs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-blue-600" />
            Customer Wallet Transactions Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit customer deposits, order debits, refunds, and promo credits.
          </p>
        </div>
        <button
          onClick={fetchTxs}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Log
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Transaction Ref</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Amount</th>
                <th className="py-3.5 px-6">Purpose / Reference</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txs.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{tx.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900">{tx.userName}</p>
                    <p className="text-xs text-slate-500">{tx.userEmail}</p>
                  </td>
                  <td className="py-4 px-6 text-xs font-bold">
                    {tx.type === "CREDIT" || tx.type === "REFUND" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <ArrowDownLeft size={14} /> {tx.type}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                        <ArrowUpRight size={14} /> {tx.type}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-900">৳ {tx.amount}</td>
                  <td className="py-4 px-6 text-slate-700 font-medium">{tx.purpose}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
