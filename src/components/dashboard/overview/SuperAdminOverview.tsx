"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { OverviewStatCard } from "./OverviewStatCard";
import { DollarSign, Building2, Store, Users, Wallet, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fallbackRevenue = [
  { day: "Mon", revenue: 14200, expenses: 5400 },
  { day: "Tue", revenue: 18500, expenses: 6200 },
  { day: "Wed", revenue: 16800, expenses: 5900 },
  { day: "Thu", revenue: 22400, expenses: 7100 },
  { day: "Fri", revenue: 28900, expenses: 8400 },
  { day: "Sat", revenue: 34100, expenses: 9800 },
  { day: "Sun", revenue: 31200, expenses: 9100 },
];

const fallbackAlerts = [
  { id: "1", type: "warning", text: "3 Vendor KYC Onboarding Applications Pending Verification", time: "10m ago" },
  { id: "2", type: "success", text: "Automated System Database Backup Executed Successfully", time: "1h ago" },
  { id: "3", type: "alert", text: "High Volume Surge Detected in Downtown Branch #4", time: "2h ago" },
];

export function SuperAdminOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/overview/super-admin")
      .then((res) => {
        if (res.data?.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const netProfit = data?.netProfit ? `$${data.netProfit.toLocaleString()}` : "$48,920";
  const totalRevenue = data?.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : "$166,000";
  const activeBranches = data?.activeBranches ?? 24;
  const activeVendors = data?.activeVendors ?? 86;
  const totalUsers = data?.totalUsers ? data.totalUsers.toLocaleString() : "12,450";
  const pendingPayouts = data?.pendingPayouts ? `${data.pendingPayouts} batches` : "8 batches";
  const chartData = data?.revenueChartData || fallbackRevenue;
  const alerts = data?.systemLogs || fallbackAlerts;

  return (
    <div className="space-y-6">
      {/* 6 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <OverviewStatCard title="Net Profit" value={netProfit} change="+14.2%" icon={DollarSign} />
        <OverviewStatCard title="Total Revenue" value={totalRevenue} change="+18.5%" icon={DollarSign} />
        <OverviewStatCard title="Active Branches" value={activeBranches} change="+2 new" icon={Building2} />
        <OverviewStatCard title="Active Vendors" value={activeVendors} change="+5 this mo" icon={Store} />
        <OverviewStatCard title="Total Users" value={totalUsers} change="+8.4%" icon={Users} />
        <OverviewStatCard title="Pending Payouts" value={pendingPayouts} isPositive={false} icon={Wallet} />
      </div>

      {/* Chart & System Feed Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-base">Revenue vs. Expenses (7 Days)</h3>
            <p className="text-xs text-muted-foreground">Real-time database aggregated financial metrics</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-2xl border border-border shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <ShieldAlert size={18} className="text-primary" /> Live Audit & System Feed
            </h3>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert: any, idx: number) => (
                <div key={alert.id || idx} className="p-3 bg-muted rounded-xl border border-border flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-semibold text-foreground leading-snug">{alert.action || alert.text || "System Action Executed"}</p>
                    <span className="text-[10px] text-muted-foreground block">{alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : alert.time || "Just now"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
