"use client";

import React from "react";
import { DollarSign, Percent, ShoppingBag, Store, UserCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatsGridProps {
  stats: {
    totalOrders:        number;
    activeBranches:     number;
    activeVendors:      number;
    grossRevenue:       number;
    netRevenue:         number;
    averageOrderValue:  number;
  };
}

// ─── Config ───────────────────────────────────────────────────────────────────

const getCards = (stats: StatsGridProps["stats"]) => [
  {
    title:       "Gross Revenue",
    value:       `৳${stats.grossRevenue.toLocaleString()}`,
    description: "Total processed payments",
    icon:        DollarSign,
    gradient:    "from-emerald-500 to-teal-600",
  },
  {
    title:       "Platform Net Revenue",
    value:       `৳${stats.netRevenue.toLocaleString()}`,
    description: "15% platform commission cut",
    icon:        Percent,
    gradient:    "from-primary to-indigo-700",
  },
  {
    title:       "Avg Order Value",
    value:       `৳${stats.averageOrderValue}`,
    description: "AOV per completed order",
    icon:        TrendingUp,
    gradient:    "from-violet-500 to-purple-600",
  },
  {
    title:       "Total Orders",
    value:       stats.totalOrders.toLocaleString(),
    description: "Accumulated system orders",
    icon:        ShoppingBag,
    gradient:    "from-sky-500 to-cyan-600",
  },
  {
    title:       "Active Branches",
    value:       stats.activeBranches,
    description: "Company-owned outlets",
    icon:        Store,
    gradient:    "from-amber-400 to-orange-500",
  },
  {
    title:       "Active Vendors",
    value:       stats.activeVendors,
    description: "Verified service providers",
    icon:        UserCheck,
    gradient:    "from-rose-500 to-pink-600",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = getCards(stats);

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={{
              hidden: { opacity: 0, y: 18 },
              show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
            }}
            whileHover={{ y: -4, transition: { duration: 0.18 } }}
            className="group relative overflow-hidden flex flex-col justify-between
              rounded-2xl border border-border bg-card p-5 min-h-[9rem]
              shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]
              dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.35)]
              hover:border-ring/40 transition-all duration-300"
          >
            {/* Ambient hover glow */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-8 -bottom-8 h-32 w-32
                rounded-full bg-gradient-to-br ${card.gradient}
                opacity-0 group-hover:opacity-[0.08] dark:group-hover:opacity-[0.14]
                blur-2xl transition-opacity duration-500`}
            />

            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="text-[10.5px] font-black uppercase tracking-widest text-muted-foreground leading-none pt-0.5">
                {card.title}
              </span>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
                  bg-gradient-to-br ${card.gradient} text-white
                  shadow-md shadow-black/10 dark:shadow-black/30
                  transition-transform duration-300
                  group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={17} strokeWidth={2.3} />
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1.5">
              <p className="text-[1.75rem] font-black leading-none tracking-tight text-card-foreground tabular-nums">
                {card.value}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground leading-snug">
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
