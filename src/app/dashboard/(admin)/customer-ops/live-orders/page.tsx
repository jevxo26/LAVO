"use client";

import React, { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { ClipboardList, RefreshCw, Search, Clock } from "lucide-react";

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/customer-ops/live-orders").then(r => r.json());
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            Customer Live Orders Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time order tracking, garment status, and branch assignment monitoring.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-50 shadow-sm transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Live Status
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by Order ID, customer, or branch..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Active Live Orders: {orders.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Service Type</th>
                <th className="py-3.5 px-6">Assigned Hub / Branch</th>
                <th className="py-3.5 px-6">Garment Count</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => {
                const customerName =
                  ord.customerName ||
                  ord.customer?.user?.fullName ||
                  ord.customer?.fullName ||
                  "Sarah Jenkins";

                const branchName =
                  typeof ord.branch === "string"
                    ? ord.branch
                    : ord.branch?.branchName || ord.branch?.name || "Central Hub";

                const totalAmount =
                  typeof ord.totalAmount === "number" || typeof ord.totalAmount === "string"
                    ? ord.totalAmount
                    : ord.payableAmount || "45.00";

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600">{ord.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{customerName}</p>
                      <p className="text-xs text-slate-500">{ord.eta || "Scheduled"}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{ord.serviceType || "Dry Clean & Wash"}</td>
                    <td className="py-4 px-6 text-slate-700 font-medium">{branchName}</td>
                    <td className="py-4 px-6 text-slate-700 font-semibold">{ord.itemsCount || 6} Pcs</td>
                    <td className="py-4 px-6 font-bold text-slate-900">৳ {totalAmount}</td>
                    <td className="py-4 px-6 text-xs">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-800">
                        <Clock size={12} /> {ord.orderStatus || ord.status || "PROCESSING"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
