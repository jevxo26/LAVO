"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  CheckCircle2, TrendingUp, Star, Clock,
  Package, XCircle, Sparkles, BarChart3, AlertCircle,
  DollarSign, Percent,
} from "lucide-react";

interface EarningsSummary { totalRevenue: number; totalCommission: number; netEarnings: number; walletBalance: number; totalEarnings: number; }
interface AnalyticsPoint  { date: string; dailyOrders: number; totalRevenue: number; netEarnings: number; }
interface PerformanceData {
  completionRate: number; acceptanceRate: number; averageProcessingTime: number;
  completedOrders: number; cancelledOrders: number; averageRating: number;
  totalReviews: number; qualityScore: number; deliveryScore: number; serviceScore: number;
  earningsSummary: EarningsSummary; recentAnalytics: AnalyticsPoint[];
}

function Sk({ className }: { className?: string }) { return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />; }
function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map((i) => <Sk key={i} className="h-28 rounded-2xl" />)}</div>
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-72 rounded-2xl" />
        <Sk className="md:col-span-2 h-72 rounded-2xl" />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl text-xs space-y-1.5">
      <p className="font-bold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-slate-900">{p.dataKey === "Orders" ? p.value : `৳${p.value.toLocaleString()}`}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="font-extrabold text-slate-900">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50"><AlertCircle size={26} className="text-rose-400" /></div>
      <p className="text-sm font-semibold text-slate-700">Could not load performance data</p>
      <Button size="sm" variant="outline" onClick={loadData} className="mt-4 rounded-xl text-xs font-bold">Retry</Button>
    </div>
  );
  if (!data) return null;

  const chartData = data.recentAnalytics.map((a) => ({
    date:     new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    Orders:   a.dailyOrders,
    Revenue:  a.totalRevenue,
    Earnings: a.netEarnings,
  }));

  return (
    <div className="space-y-7">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">Vendor Dashboard</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Performance</h1>
            <p className="mt-1 text-sm text-indigo-200">Track your completion rates, ratings, and earnings analytics.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Completion</p>
              <p className="text-white font-extrabold text-xl leading-tight">{data.completionRate.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
              <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Rating</p>
              <p className="text-white font-extrabold text-xl leading-tight">{data.averageRating.toFixed(1)} ★</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Completion Rate",  sub: `${data.completedOrders} completed`,    value: `${data.completionRate.toFixed(1)}%`,      Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
          { label: "Acceptance Rate",  sub: `${data.cancelledOrders} cancelled`,    value: `${data.acceptanceRate.toFixed(1)}%`,      Icon: Percent,      iconBg: "bg-blue-50",    iconColor: "text-blue-600",    ringColor: "ring-blue-100"    },
          { label: "Avg. Processing",  sub: "Hours per order",                       value: `${data.averageProcessingTime.toFixed(1)}h`, Icon: Clock,       iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
          { label: "Avg. Rating",      sub: `${data.totalReviews} reviews`,          value: `${data.averageRating.toFixed(1)} / 5`,   Icon: Star,         iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
        ].map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
              <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
              <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid: Chart + Quality ─────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-6 items-start">

        {/* Chart */}
        <div className="md:col-span-4 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50"><BarChart3 size={14} className="text-indigo-500" /></div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Orders &amp; Earnings (Last 7 Days)</h2>
                <p className="text-[11px] text-slate-400">Daily volume and net earnings trend</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />Orders</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Earnings</span>
            </div>
          </div>
          <div className="px-2 py-4 h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="Orders"   fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Earnings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No analytics data yet.</div>
            )}
          </div>
        </div>

        {/* Quality scores + Earnings */}
        <div className="md:col-span-2 space-y-5">

          {/* Quality scores */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50"><Star size={13} className="text-amber-500" /></div>
              <h2 className="text-sm font-extrabold text-slate-900">Quality Scores</h2>
            </div>
            <div className="p-5 space-y-4">
              <ScoreBar label="Quality"  value={data.qualityScore}  color="bg-indigo-500"  />
              <ScoreBar label="Delivery" value={data.deliveryScore} color="bg-emerald-500" />
              <ScoreBar label="Service"  value={data.serviceScore}  color="bg-amber-400"   />
            </div>
          </div>

          {/* Earnings summary */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50"><DollarSign size={13} className="text-emerald-500" /></div>
              <h2 className="text-sm font-extrabold text-slate-900">Earnings Summary</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { label: "Total Revenue",    value: data.earningsSummary.totalRevenue,    color: "text-slate-900"    },
                { label: "Commission",       value: data.earningsSummary.totalCommission, color: "text-rose-600"     },
                { label: "Net Earnings",     value: data.earningsSummary.netEarnings,     color: "text-emerald-600"  },
                { label: "Wallet Balance",   value: data.earningsSummary.walletBalance,   color: "text-indigo-600"   },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs font-semibold text-slate-500">{label}</span>
                  <span className={`text-sm font-extrabold ${color}`}>৳{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
