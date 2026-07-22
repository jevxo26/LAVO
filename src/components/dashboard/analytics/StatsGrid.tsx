"use client";

import React from "react";
import { DollarSign, Percent, ShoppingBag, Store, UserCheck, TrendingUp } from "lucide-react";

interface StatsGridProps {
  stats: {
    totalOrders: number;
    activeBranches: number;
    activeVendors: number;
    grossRevenue: number;
    netRevenue: number;
    averageOrderValue: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { title: "Gross Revenue", value: `$${stats.grossRevenue.toLocaleString()}`, description: "Total processed payments", icon: DollarSign, color: "text-green-600 bg-green-50" },
    { title: "Platform Net Revenue", value: `$${stats.netRevenue.toLocaleString()}`, description: "15% platform commission cut", icon: Percent, color: "text-blue-600 bg-blue-50" },
    { title: "Average Order Value", value: `$${stats.averageOrderValue}`, description: "AOV per completed order", icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
    { title: "Total Orders", value: stats.totalOrders.toLocaleString(), description: "Accumulated system orders", icon: ShoppingBag, color: "text-indigo-600 bg-indigo-50" },
    { title: "Active Branches", value: stats.activeBranches, description: "Company owned outlets", icon: Store, color: "text-amber-600 bg-amber-50" },
    { title: "Active Vendors", value: stats.activeVendors, description: "Verified service providers", icon: UserCheck, color: "text-teal-600 bg-teal-50" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">{card.title}</span>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{card.value}</h3>
              <p className="text-slate-400 text-xs">{card.description}</p>
            </div>
            <div className={`p-4 rounded-2xl ${card.color}`}>
              <Icon size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
