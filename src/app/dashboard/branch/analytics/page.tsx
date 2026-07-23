"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CircleDollarSign, TrendingUp, RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";

export default function BranchAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await authFetch("/branch-dashboard/analytics");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch branch analytics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Listen for WebSocket updates from garment scans / order updates
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

    socket.on("garmentStatusUpdated", () => {
      fetchAnalytics();
    });

    socket.on("orderStatusUpdated", () => {
      fetchAnalytics();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchAnalytics]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Calculating live branch analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Error loading analytics data. Please try again.
      </div>
    );
  }

  const totals = data.totals || {
    totalRevenue: data.revenue?.reduce((acc: number, val: any) => acc + val.total, 0) || 0,
    totalExpenses: data.expenses?.reduce((acc: number, val: any) => acc + val.total, 0) || 0,
    netProfit: (data.revenue?.reduce((acc: number, val: any) => acc + val.total, 0) || 0) -
               (data.expenses?.reduce((acc: number, val: any) => acc + val.total, 0) || 0),
  };

  // Merge revenue, expenses, and profit for Recharts
  const chartData = (data.revenue || []).map((rev: any, i: number) => {
    const exp = data.expenses?.[i]?.total || 0;
    return {
      name: rev.name,
      revenue: rev.total,
      expenses: exp,
      profit: parseFloat((rev.total - exp).toFixed(2)),
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Branch Analytics & Financials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time database-driven financial reports, revenue streams, and cost breakdown.
          </p>
        </div>

        <Button
          onClick={handleManualRefresh}
          variant="outline"
          className="self-start md:self-auto rounded-xl border-slate-200 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Live Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Revenue (7d)</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ৳{totals.totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Live customer payments & bookings</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Expenses & Commissions (7d)</CardTitle>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              ৳{totals.totalExpenses.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Operational costs & vendor splits</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Net Profit (7d)</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ৳{totals.netProfit.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">Estimated net branch margin</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Financial Trend Chart */}
      <Card className="border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            7-Day Financial Performance Tracker
          </CardTitle>
          <CardDescription className="text-xs">
            Live trend of daily revenue vs operational costs and profit.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <RechartsTooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                activeDot={{ r: 8 }}
                name="Revenue (৳)"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses (৳)"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#10b981"
                strokeWidth={2.5}
                name="Net Profit (৳)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
