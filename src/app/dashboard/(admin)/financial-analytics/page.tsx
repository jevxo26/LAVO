"use client";

import React from "react";
import { CircleDollarSign, TrendingUp, ArrowDownRight, ArrowUpRight, CreditCard, Banknote, Calendar } from "lucide-react";

export default function FinancialAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CircleDollarSign className="text-blue-600" />
            Financial Analytics & Revenue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track gross merchandise value (GMV), vendor commissions, and operational profit margins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm">
            <Calendar size={16} /> July 2026
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">Total Monthly GMV</span>
            <Banknote size={24} className="text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold">৳ 12,48,500</h2>
          <div className="flex items-center text-xs text-blue-100 gap-1">
            <ArrowUpRight size={14} className="text-emerald-300" />
            <span>+18.5% compared to last month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Platform Commission Earned</span>
            <TrendingUp size={24} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">৳ 1,87,275</h2>
          <div className="flex items-center text-xs text-emerald-600 gap-1 font-medium">
            <span>Average Commission: 15.0%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Vendor Net Payouts</span>
            <CreditCard size={24} className="text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">৳ 10,61,225</h2>
          <div className="flex items-center text-xs text-slate-500 gap-1 font-medium">
            <span>Settled & Pending Vendor Share</span>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Branch & Vendor Revenue Breakdown</h2>
          <span className="text-xs text-slate-400">July 1 - July 31, 2026</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Entity Name</th>
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Total Orders</th>
                <th className="py-3 px-6">Gross Volume</th>
                <th className="py-3 px-6">Commission / Margin</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: "Central Hub - Sector 4", type: "IN_HOUSE_BRANCH", orders: 420, gross: "৳ 4,20,000", comm: "৳ 4,20,000 (100%)", status: "SETTLED" },
                { name: "Apex Cleaners Ltd.", type: "PARTNER_VENDOR", orders: 190, gross: "৳ 2,45,000", comm: "৳ 36,750 (15%)", status: "SETTLED" },
                { name: "Gulshan Processing Center", type: "IN_HOUSE_BRANCH", orders: 380, gross: "৳ 3,80,000", comm: "৳ 3,80,000 (100%)", status: "SETTLED" },
                { name: "SilkCare Specialty Laundry", type: "PARTNER_VENDOR", orders: 85, gross: "৳ 1,20,000", comm: "৳ 14,400 (12%)", status: "PENDING" },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{row.name}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-700">
                      {row.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">{row.orders}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{row.gross}</td>
                  <td className="py-4 px-6 font-medium text-emerald-600">{row.comm}</td>
                  <td className="py-4 px-6 text-xs">
                    <span className={`px-2.5 py-1 rounded-full font-bold ${row.status === "SETTLED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {row.status}
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
