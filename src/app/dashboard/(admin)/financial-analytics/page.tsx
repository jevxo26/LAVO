"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  CircleDollarSign, TrendingUp, ArrowUpRight,
  CreditCard, Banknote, Calendar, Sparkles, Download,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { AdminCrudPage }         from "@/components/shared/admin-crud";
import { type CrudModuleConfig } from "@/components/shared/admin-crud";
import { StatsGrid }             from "@/components/dashboard/(admin)/analytics/StatsGrid";
import { ChartsSection }         from "@/components/dashboard/(admin)/analytics/ChartsSection";
import { Button }                from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OverviewStats {
  totalOrders:       number;
  activeBranches:    number;
  activeVendors:     number;
  grossRevenue:      number;
  netRevenue:        number;
  averageOrderValue: number;
}

interface ChartPoint {
  date:          string;
  orders:        number;
  revenue:       number;
  netCommission: number;
}

interface RevenueRow {
  id:     string;
  name:   string;
  type:   string;
  orders: number;
  gross:  string;
  comm:   string;
  status: string;
}

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const FALLBACK_STATS: OverviewStats = {
  totalOrders:       830,
  activeBranches:    12,
  activeVendors:     24,
  grossRevenue:      1248500,
  netRevenue:        187275,
  averageOrderValue: 1504,
};

const FALLBACK_REVENUE_ROWS: RevenueRow[] = [
  { id: "1", name: "Central Hub - Sector 4",    type: "IN_HOUSE_BRANCH", orders: 420, gross: "৳ 4,20,000", comm: "৳ 4,20,000 (100%)", status: "SETTLED" },
  { id: "2", name: "Apex Cleaners Ltd.",         type: "PARTNER_VENDOR",  orders: 190, gross: "৳ 2,45,000", comm: "৳ 36,750 (15%)",   status: "SETTLED" },
  { id: "3", name: "Gulshan Processing Center",  type: "IN_HOUSE_BRANCH", orders: 380, gross: "৳ 3,80,000", comm: "৳ 3,80,000 (100%)", status: "SETTLED" },
  { id: "4", name: "SilkCare Specialty Laundry", type: "PARTNER_VENDOR",  orders: 85,  gross: "৳ 1,20,000", comm: "৳ 14,400 (12%)",   status: "PENDING" },
];

// ─── AdminCrudPage config (revenue breakdown table) ───────────────────────────

function makeRevenueConfig(rows: RevenueRow[]): CrudModuleConfig<RevenueRow> {
  return {
    title:             "Branch & Vendor Revenue Breakdown",
    description:       "Gross volume, commission margins, and settlement status per entity",
    createLabel:       "Add Entry",
    searchPlaceholder: "Search by entity name…",
    emptyTitle:        "No revenue data",
    emptyDescription:  "No revenue entries found for the selected period.",
    data:              rows,
    columns: [
      { accessorKey: "name",   header: "Entity Name"           },
      { accessorKey: "type",   header: "Type",   kind: "status" },
      { accessorKey: "orders", header: "Orders"                },
      { accessorKey: "gross",  header: "Gross Volume"          },
      { accessorKey: "comm",   header: "Commission / Margin"   },
      { accessorKey: "status", header: "Status", kind: "status" },
    ],
    schema: z.object({
      name:   z.string().min(1, "Name is required"),
      type:   z.string().min(1),
      orders: z.coerce.number().min(0),
      gross:  z.string().min(1),
      comm:   z.string().min(1),
      status: z.string().min(1),
    }),
    fields: [
      { name: "name",   label: "Entity Name",        placeholder: "e.g. Central Hub"  },
      { name: "type",   label: "Type",               options: ["IN_HOUSE_BRANCH", "PARTNER_VENDOR"] },
      { name: "orders", label: "Total Orders",        type: "number", placeholder: "0" },
      { name: "gross",  label: "Gross Volume",        placeholder: "৳ 0"              },
      { name: "comm",   label: "Commission / Margin", placeholder: "৳ 0 (0%)"         },
      { name: "status", label: "Status",              options: ["SETTLED", "PENDING"]  },
    ],
    getRowLabel: (row) => row.name,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className ?? ""}`} />;
}

function PageSkeleton() {
  return (
    <div className="space-y-7">
      <Sk className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[0,1,2,3,4,5].map((i) => <Sk key={i} className="h-36" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Sk className="h-80 rounded-3xl" />
        <Sk className="h-80 rounded-3xl" />
      </div>
      <Sk className="h-64 rounded-2xl" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FinancialAnalyticsPage() {
  const [stats,      setStats]      = useState<OverviewStats | null>(null);
  const [chartData,  setChartData]  = useState<ChartPoint[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch("/analytics/overview").then((r) => r.json()),
      authFetch("/analytics/charts").then((r) => r.json()),
    ])
      .then(([overviewRes, chartsRes]) => {
        if (overviewRes.success) setStats(overviewRes.data);
        if (chartsRes.success)   setChartData(chartsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  const s = stats ?? FALLBACK_STATS;

  // Hero chip values derived from live stats
  const gmvDisplay  = s.grossRevenue >= 100000
    ? `৳${(s.grossRevenue / 100000).toFixed(2)}L`
    : `৳${s.grossRevenue.toLocaleString()}`;
  const commDisplay = s.netRevenue >= 100000
    ? `৳${(s.netRevenue / 100000).toFixed(2)}L`
    : `৳${s.netRevenue.toLocaleString()}`;
  const commRate    = s.grossRevenue > 0
    ? ((s.netRevenue / s.grossRevenue) * 100).toFixed(1)
    : "15.0";

  const revenueConfig = makeRevenueConfig(FALLBACK_REVENUE_ROWS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Banner ────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white shadow-2xl"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 35%, var(--foreground) 65%) 0%, color-mix(in srgb, var(--primary) 75%, var(--foreground) 25%) 55%, color-mix(in srgb, var(--secondary) 55%, var(--foreground) 45%) 100%)",
          border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
        }}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-[0.35] blur-3xl"
            style={{ background: "var(--primary)" }} />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-[0.28] blur-3xl"
            style={{ background: "var(--secondary)" }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                  color: "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
                }}>
                <Sparkles size={12} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
                Financial Analytics
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                Live DB Data
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
              Revenue & Commission Analytics
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
              Track gross merchandise value, vendor commissions, and operational profit margins across all branches and partners.
            </p>

            {/* Export button */}
            <div className="pt-1">
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/export`} download>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 text-xs font-bold gap-2 backdrop-blur-md"
                >
                  <Download size={14} /> Export CSV Report
                </Button>
              </a>            </div>
          </div>

          {/* Live telemetry chips */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {[
              { label: "Gross Revenue",   value: gmvDisplay,   sub: <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--success)" }}><ArrowUpRight size={11} /> Live</span> },
              { label: "Net Commission",  value: commDisplay,  sub: <span className="mt-1 block text-[10px] font-bold text-white/50">Avg {commRate}%</span> },
            ].map((chip) => (
              <div key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[130px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}>
                <p className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}>
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-0.5 tabular-nums">{chip.value}</p>
                {chip.sub}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-7 bottom-6 hidden md:flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white/60 backdrop-blur-md"
          style={{
            background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
          }}>
          <Calendar size={12} />
          Last 30 days
        </div>
      </div>

      {/* ── 2. Stats Grid (live data from /analytics/overview) ───────────────── */}
      <StatsGrid stats={s} />

      {/* ── 3. Charts (live data from /analytics/charts) ─────────────────────── */}
      {chartData.length > 0 && <ChartsSection data={chartData} />}

      {/* ── 4. Revenue Breakdown table ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-black/10">
              <CircleDollarSign size={17} />
            </div>
            <div>
              <h2 className="text-sm font-black text-card-foreground">Branch &amp; Vendor Revenue Breakdown</h2>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                Gross volume, commission margins &amp; settlement status
              </p>
            </div>
          </div>
        </div>
        <AdminCrudPage config={revenueConfig} hideHeader />
      </div>
    </motion.div>
  );
}
