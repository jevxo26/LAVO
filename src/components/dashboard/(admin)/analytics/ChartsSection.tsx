"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ChartsSectionProps {
  data: any[];
}

export function ChartsSection({ data }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue & Commission Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Revenue & Commission Trends</h3>
          <p className="text-slate-400 text-xs mt-0.5">30-day view of gross revenue and net platform earnings.</p>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} name="Gross Revenue ($)" />
              <Area type="monotone" dataKey="netCommission" stroke="#10b981" fill="#ecfdf5" strokeWidth={2} name="Commission ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Volume Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Order Quantities</h3>
          <p className="text-slate-400 text-xs mt-0.5">Daily volume of processed laundry checkout orders.</p>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Orders Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
