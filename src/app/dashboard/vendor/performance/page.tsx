"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { authFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CheckCircle, TrendingUp, Star, Clock,
  Package, XCircle,
} from "lucide-react";

interface EarningsSummary {
  totalRevenue: number;
  totalCommission: number;
  netEarnings: number;
  walletBalance: number;
  totalEarnings: number;
}

interface AnalyticsPoint {
  date: string;
  dailyOrders: number;
  totalRevenue: number;
  netEarnings: number;
}

interface PerformanceData {
  completionRate: number;
  acceptanceRate: number;
  averageProcessingTime: number;
  completedOrders: number;
  cancelledOrders: number;
  averageRating: number;
  totalReviews: number;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  earningsSummary: EarningsSummary;
  recentAnalytics: AnalyticsPoint[];
}

export default function VendorPerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch("/vendor-dashboard/performance")
      .then((r) => r.json())
      .then((j) => { if (j.success) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="p-8 text-sm text-slate-400">No performance data yet.</div>;

  const chartData = data.recentAnalytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Orders: a.dailyOrders,
    Revenue: a.totalRevenue,
    Earnings: a.netEarnings,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Performance" description="Track your completion rate, ratings, and earnings analytics." />

      {/* Rate Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completion Rate</CardTitle>
            <CheckCircle className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mt-1">{data.completedOrders} orders completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Acceptance Rate</CardTitle>
            <TrendingUp className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-slate-400 mt-1">{data.cancelledOrders} orders cancelled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg. Processing Time</CardTitle>
            <Clock className="size-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageProcessingTime.toFixed(1)}</div>
            <p className="text-xs text-slate-400 mt-1">Hours per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Avg. Rating", value: `${data.averageRating.toFixed(1)} / 5`, icon: Star, color: "text-amber-500" },
          { label: "Quality Score", value: `${data.qualityScore.toFixed(1)}%`, icon: Package, color: "text-indigo-500" },
          { label: "Delivery Score", value: `${data.deliveryScore.toFixed(1)}%`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Service Score", value: `${data.serviceScore.toFixed(1)}%`, icon: CheckCircle, color: "text-blue-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
              <Icon className={`size-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              {label === "Avg. Rating" && (
                <p className="text-xs text-slate-400 mt-1">{data.totalReviews} reviews</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Revenue", value: data.earningsSummary.totalRevenue },
          { label: "Commission Deducted", value: data.earningsSummary.totalCommission },
          { label: "Net Earnings", value: data.earningsSummary.netEarnings },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last 7 Days — Orders & Revenue</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
