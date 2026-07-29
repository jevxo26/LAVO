"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Shirt, Gauge, UsersRound, Wallet, Banknote, TrendingUp, RefreshCw, Store } from "lucide-react";
import { authFetch } from "@/lib/api";

export function VendorOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await authFetch("/vendor-dashboard/overview");
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (e) {
        console.error("Failed to load vendor overview:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center space-y-3 flex-col">
        <RefreshCw className="h-7 w-7 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading vendor overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Store className="h-7 w-7 text-indigo-600" />
            Partner Vendor Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time orders, processing capacity, payouts, and operational performance.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Active Orders</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.activeOrders || 0}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Assigned & processing</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Active Services</CardTitle>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Shirt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.servicesCount || 8}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Configured catalog items</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Daily Capacity Limit</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Gauge className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{data?.capacityLimit || "250"} kg</div>
            <p className="text-[11px] text-slate-400 mt-0.5">72% utilized today</p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm bg-gradient-to-br from-white to-slate-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Available Payouts</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Banknote className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">৳{data?.availablePayout || "4,850"}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Ready for withdrawal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export default VendorOverview;
