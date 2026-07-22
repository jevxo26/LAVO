"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/components/dashboard/analytics/StatsGrid";
import { ChartsSection } from "@/components/dashboard/analytics/ChartsSection";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axios.get("/api/analytics/overview"),
          axios.get("/api/analytics/charts"),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartRes.data.data);
      } catch (err) {
        console.error("Failed to load analytics dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="text-slate-400 text-sm font-semibold">Loading platform business analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Business Intelligence</h1>
            <p className="text-slate-400 text-sm mt-0.5">Real-time indicators tracking platform revenue, commissions, and order volumes.</p>
          </div>
        </div>
        <a
          href="/api/analytics/export"
          download
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md text-sm"
        >
          <Download size={16} /> Export Report (CSV)
        </a>
      </div>

      {/* KPI Stats Cards Grid */}
      {stats && <StatsGrid stats={stats} />}

      {/* Visual Charts */}
      {chartData.length > 0 && <ChartsSection data={chartData} />}
    </div>
  );
}
