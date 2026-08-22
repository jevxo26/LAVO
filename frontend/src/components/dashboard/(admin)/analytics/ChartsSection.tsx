"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartsSectionProps {
  data: any[];
}

// ─── Custom tooltips ──────────────────────────────────────────────────────────

function AreaTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1.5 dark:bg-card">
      <p className="font-black text-card-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.stroke }} />
          <span className="text-muted-foreground font-medium">{p.name}:</span>
          <span className="font-black text-card-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl text-xs space-y-1.5 dark:bg-card">
      <p className="font-black text-card-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground font-medium">{p.name}:</span>
          <span className="font-black text-card-foreground">{p.value} orders</span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ChartsSection({ data }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Revenue & Commission Area Chart ─────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md shadow-black/10">
            <TrendingUp size={17} strokeWidth={2.3} />
          </div>
          <div>
            <h3 className="text-sm font-black text-card-foreground">Revenue &amp; Commission Trends</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              30-day view of gross revenue and net platform earnings
            </p>
          </div>
        </div>

        <div className="px-4 py-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gradComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<AreaTooltip />} />
              <Area
                type="monotone" dataKey="revenue"
                stroke="#6366f1" strokeWidth={2.5}
                fill="url(#gradRevenue)"
                dot={false} activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 0 }}
                name="Gross Revenue (৳)"
              />
              <Area
                type="monotone" dataKey="netCommission"
                stroke="#22c55e" strokeWidth={2.2}
                fill="url(#gradComm)"
                dot={false} activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
                name="Commission (৳)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 border-t border-border px-6 py-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            Gross Revenue
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Commission
          </div>
        </div>
      </div>

      {/* ── Order Volume Bar Chart ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-black/10">
            <BarChart3 size={17} strokeWidth={2.3} />
          </div>
          <div>
            <h3 className="text-sm font-black text-card-foreground">Daily Order Volume</h3>
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Daily volume of processed laundry checkout orders
            </p>
          </div>
        </div>

        <div className="px-4 py-5 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar
                dataKey="orders"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                name="Orders Count"
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 border-t border-border px-6 py-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            Orders
          </div>
        </div>
      </div>

    </div>
  );
}
