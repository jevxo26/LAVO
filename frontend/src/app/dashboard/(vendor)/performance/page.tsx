"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2, TrendingUp, Star, Clock,
  BarChart3, AlertCircle, DollarSign, Percent,
} from "lucide-react";
import { motion } from "framer-motion";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EarningsSummary {
  totalRevenue: number; totalCommission: number;
  netEarnings: number; walletBalance: number; totalEarnings: number;
}
interface AnalyticsPoint {
  date: string; dailyOrders: number; totalRevenue: number; netEarnings: number;
}
interface PerformanceData {
  completionRate: number; acceptanceRate: number; averageProcessingTime: number;
  completedOrders: number; cancelledOrders: number; averageRating: number;
  totalReviews: number; qualityScore: number; deliveryScore: number; serviceScore: number;
  earningsSummary: EarningsSummary; recentAnalytics: AnalyticsPoint[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-7 animate-pulse">
      <div className="h-44 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0,1,2,3].map((i) => <div key={i} className="h-28 rounded-3xl bg-muted" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-6">
        <div className="md:col-span-4 h-72 rounded-3xl bg-muted" />
        <div className="md:col-span-2 space-y-4">
          <div className="h-48 rounded-3xl bg-muted" />
          <div className="h-52 rounded-3xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-black text-card-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="font-black text-card-foreground">
            {p.dataKey === "Orders" ? p.value : `৳${Number(p.value).toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-card-foreground">{label}</span>
        <span className="font-black text-card-foreground">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendorPerformancePage() {
  const [data, setData]       = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  const loadData = async () => {
    setError(false);
    try {
      const res  = await authFetch("/vendor-dashboard/performance");
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <PageSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
        <AlertCircle size={26} />
      </div>
      <p className="text-sm font-black text-card-foreground">Could not load performance data</p>
      <Button size="sm" variant="outline" onClick={loadData} className="mt-4 rounded-xl text-xs font-bold border-border">
        Retry
      </Button>
    </div>
  );

  if (!data) return null;

  const chartData = data.recentAnalytics.map((a) => ({
    date:     new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Orders:   a.dailyOrders,
    Earnings: a.netEarnings,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Vendor Dashboard"
        title="Performance Analytics"
        description="Track your completion rates, acceptance rates, quality scores, and earnings trends."
        icon={BarChart3}
        chips={[
          { label: "Completion", value: `${data.completionRate.toFixed(1)}%`  },
          { label: "Rating",     value: `${data.averageRating.toFixed(1)} ★`  },
          { label: "Reviews",    value: data.totalReviews                      },
        ]}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <OverviewStatCard label="Completion Rate"  sub={`${data.completedOrders} completed`}  value={`${data.completionRate.toFixed(1)}%`}       icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"  />
        <OverviewStatCard label="Acceptance Rate"  sub={`${data.cancelledOrders} cancelled`}  value={`${data.acceptanceRate.toFixed(1)}%`}       icon={Percent}      gradient="from-blue-500 to-indigo-600"   />
        <OverviewStatCard label="Avg Processing"   sub="Hours per order"                       value={`${data.averageProcessingTime.toFixed(1)}h`} icon={Clock}       gradient="from-violet-500 to-purple-600" />
        <OverviewStatCard label="Avg Rating"       sub={`${data.totalReviews} reviews`}        value={`${data.averageRating.toFixed(1)} / 5`}     icon={Star}         gradient="from-amber-400 to-orange-500"  />
      </div>

      {/* ── 3. Chart + Quality/Earnings ──────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Orders & Earnings Chart */}
        <div className="md:col-span-4 rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"
                style={{ color: "var(--primary)" }}>
                <BarChart3 size={17} />
              </div>
              <div>
                <h2 className="text-sm font-black text-card-foreground">Orders &amp; Earnings (Last 7 Days)</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Daily volume and net earnings trend</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} /> Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success" /> Earnings
              </span>
            </div>
          </div>
          <div className="px-2 py-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    style={{ fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                    style={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "color-mix(in srgb, var(--muted) 60%, transparent)" }} />
                  <Bar dataKey="Orders"   fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Earnings" fill="var(--success)"  radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground font-medium">
                No analytics data yet.
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-5">

          {/* Quality Scores */}
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10"
                style={{ color: "var(--warning)" }}>
                <Star size={17} />
              </div>
              <div>
                <h2 className="text-sm font-black text-card-foreground">Quality Scores</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Based on customer feedback</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <ScoreBar label="Quality"  value={data.qualityScore}  gradient="from-indigo-500 to-violet-600"  />
              <ScoreBar label="Delivery" value={data.deliveryScore} gradient="from-emerald-500 to-teal-600"   />
              <ScoreBar label="Service"  value={data.serviceScore}  gradient="from-amber-400 to-orange-500"   />
            </div>
          </div>

          {/* Earnings Summary */}
          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                <DollarSign size={17} />
              </div>
              <div>
                <h2 className="text-sm font-black text-card-foreground">Earnings Summary</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Revenue, commission & net</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Total Revenue",  value: data.earningsSummary.totalRevenue,    color: "text-card-foreground" },
                { label: "Commission",     value: data.earningsSummary.totalCommission, color: "text-error"           },
                { label: "Net Earnings",   value: data.earningsSummary.netEarnings,     color: "text-success"         },
                { label: "Wallet Balance", value: data.earningsSummary.walletBalance,   color: "text-primary"         },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs font-bold text-muted-foreground">{label}</span>
                  <span className={`text-sm font-black ${color}`}>৳{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
