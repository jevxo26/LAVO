"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface OverviewStatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  gradient?: string; // e.g. "from-indigo-500 to-violet-600"
  subLabel?: string;
}

export function OverviewStatCard({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  gradient = "from-indigo-500 to-violet-600",
  subLabel,
}: OverviewStatCardProps) {
  return (
    <div className="
      group relative overflow-hidden flex flex-col justify-between
      rounded-2xl border border-border bg-card p-5 shadow-sm
      transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
    ">
      {/* Gradient wash on hover */}
      <div className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0
        group-hover:opacity-[0.05] transition-opacity duration-300
        bg-gradient-to-br ${gradient}`}
      />

      {/* Top: label + icon */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground leading-none pr-2">
          {title}
        </span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
          bg-gradient-to-br ${gradient} shadow-sm text-white
          transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={18} strokeWidth={2} />
        </div>
      </div>

      {/* Value */}
      <div>
        <div className="text-[1.7rem] font-extrabold text-foreground leading-none tracking-tight">
          {value}
        </div>
        {subLabel && (
          <p className="mt-1 text-[11px] text-muted-foreground font-medium">{subLabel}</p>
        )}
        {change && (
          <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold
            ${isPositive
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"}`}>
            {isPositive
              ? <TrendingUp size={11} strokeWidth={2.5} />
              : <TrendingDown size={11} strokeWidth={2.5} />}
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
