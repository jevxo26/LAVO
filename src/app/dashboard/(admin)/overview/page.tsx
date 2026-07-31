"use client";

import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Building2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function OverviewPage() {
  const stats = [
    {
      label: "Total Platform Revenue",
      value: "৳ 4,82,500",
      change: "+14.2%",
      isPositive: true,
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Active Orders",
      value: "128",
      change: "+8.4%",
      isPositive: true,
      icon: ShoppingBag,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Total Customers",
      value: "14,290",
      change: "+5.1%",
      isPositive: true,
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      label: "Operational Branches",
      value: "12",
      change: "Stable",
      isPositive: true,
      icon: Building2,
      color: "bg-amber-500/10 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Laundrix Platform Overview
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Zap size={12} /> Live Sync
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-branch and multi-vendor metrics snapshot.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs text-slate-500">
            <p className="font-medium text-slate-700">System Status</p>
            <p className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
              <ShieldCheck size={12} /> All Operational
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                {stat.change} <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Branch Activity</h2>
            <span className="text-xs text-slate-400">Updated just now</span>
          </div>
          <div className="space-y-3">
            {[
              { branch: "Central Hub - Sector 4", action: "Capacity reached 78%", time: "5 Mins ago", status: "NORMAL" },
              { branch: "Gulshan Processing Center", action: "15 Express orders assigned to Vendor Apex", time: "12 Mins ago", status: "DISPATCHED" },
              { branch: "Dhanmondi Laundrix Hub", action: "Machine Unit #4 maintenance completed", time: "30 Mins ago", status: "RESOLVED" },
            ].map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                <div>
                  <p className="font-semibold text-slate-800">{act.branch}</p>
                  <p className="text-xs text-slate-500">{act.action}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Clock size={12} /> {act.time}
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold rounded bg-blue-100 text-blue-700">
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/dashboard/customer-ops/live-orders" className="w-full flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 font-medium text-sm hover:bg-blue-100 transition-colors">
              <span>View Live Orders</span>
              <ArrowUpRight size={16} />
            </a>
            <a href="/dashboard/branch-ops/capacity-monitor" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors">
              <span>Monitor Branch Capacity</span>
              <ArrowUpRight size={16} />
            </a>
            <a href="/dashboard/financial-analytics" className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors">
              <span>Financial Reports</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
