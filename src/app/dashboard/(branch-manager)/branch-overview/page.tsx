"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Clock, CheckCircle, Store, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import io from "socket.io-client";

export default function BranchOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await authFetch("/branch-dashboard/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch branch overview:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();

    // Connect Socket.io for live updates when scans or order status changes occur
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");

    socket.on("garmentStatusUpdated", () => {
      fetchOverview();
    });

    socket.on("orderStatusUpdated", () => {
      fetchOverview();
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOverview]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchOverview();
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading live branch overview...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Error loading overview data. Please try again.
      </div>
    );
  }

  const capacityUtilization = parseFloat(data.capacityUtilization || "0");
  const capacityData = [
    { name: "Used Capacity", value: capacityUtilization, color: "#6366f1" },
    { name: "Available Capacity", value: Math.max(0, 100 - capacityUtilization), color: "#e2e8f0" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="h-7 w-7 text-indigo-600" />
            Branch Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time capacity tracking, live order load, and active machinery status.
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

      {/* KPI Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Capacity Utilization</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{capacityUtilization}%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Of daily maximum limit</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Active Processing</CardTitle>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.activeOrders || 0} Orders</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Currently being processed</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Pending Orders</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data.pendingOrders || 0} Orders</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Waiting for pickup / confirmation</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Partner Vendor Delegated</CardTitle>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Store className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{data.vendorDelegatedOrders || 0} Orders</div>
            <p className="text-[11px] text-purple-600 mt-0.5 font-medium">Delegated to 3 branch vendors</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Active Machinery Load</CardTitle>
            <CardDescription className="text-xs">
              Live machines currently running based on garment stages (Washers, Dryers, Irons).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activeMachinery || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="type" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <RechartsTooltip />
                <Bar dataKey="active" fill="#6366f1" radius={[4, 4, 0, 0]} name="Active Machines" />
                <Bar dataKey="count" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Total Fleet" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Capacity Breakdown</CardTitle>
            <CardDescription className="text-xs">Live daily maximum capacity utilization</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={capacityData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {capacityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
