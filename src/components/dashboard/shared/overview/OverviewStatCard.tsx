"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface OverviewStatCardProps {
  title?: string;
  label?: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  gradient?: string; // e.g. "from-indigo-500 to-violet-600"
  subLabel?: string;
  sub?: string;
}

export function OverviewStatCard({
  title,
  label,
  value,
  change,
  isPositive = true,
  icon: Icon,
  gradient = "from-indigo-500 to-violet-600",
  subLabel,
  sub,
}: OverviewStatCardProps) {
  const displayTitle = title || label || "";
  const displaySub = subLabel || sub || "";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="
        group relative overflow-hidden flex flex-col justify-between
        rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md p-5 shadow-sm
        hover:shadow-xl hover:border-indigo-200/80 transition-all duration-300
        dark:bg-slate-900/90 dark:border-slate-800 dark:hover:border-slate-700
      "
    >
      {/* Top subtle gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      {/* Background glow circle on hover */}
      <div
        className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full
          bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`}
      />

      {/* Top row: title + glowing icon */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none pr-2">
          {displayTitle}
        </span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
            bg-gradient-to-br ${gradient} text-white shadow-md shadow-indigo-500/15
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>

      {/* Value section */}
      <div>
        <div className="text-2xl lg:text-[1.75rem] font-black text-slate-900 dark:text-white leading-none tracking-tight">
          {value}
        </div>

        {displaySub && (
          <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
            {displaySub}
          </p>
        )}

        {change && (
          <div className="mt-3.5 flex items-center gap-1.5">
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black
                ${
                  isPositive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                    : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                }`}
            >
              {isPositive ? (
                <TrendingUp size={11} strokeWidth={2.5} />
              ) : (
                <TrendingDown size={11} strokeWidth={2.5} />
              )}
              {change}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
