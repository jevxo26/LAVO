"use client";

import Link from "next/link";
import { PackageCheck, Truck, CheckCircle2, Navigation, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  sub: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconGradient: string;
  Icon: React.ElementType;
  href: string;
}

function StatCard({ label, sub, value, trend, trendUp, iconGradient, Icon, href }: StatCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative overflow-hidden flex flex-col justify-between gap-3 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 bg-gradient-to-br from-blue-500 to-cyan-500" />
        <div className="flex items-start justify-between">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient} shadow-md text-white transition-transform duration-300 group-hover:scale-105`}>
            <Icon size={20} strokeWidth={2} />
          </div>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${trendUp ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"}`}>
              <TrendingUp size={9} strokeWidth={2.5} className={trendUp ? "" : "rotate-180"} />
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">{label}</p>
          <p className="text-[11px] font-medium text-slate-400 leading-tight">{sub}</p>
        </div>
      </motion.div>
    </Link>
  );
}

interface Props {
  availablePickups: number;
  activeDeliveries: number;
  completedToday: number;
  assignedRoutes: number;
  totalDeliveries: number;
}

export function AgentStatCards({ availablePickups, activeDeliveries, completedToday, assignedRoutes, totalDeliveries }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Available Pickups" sub="Pending collection"
        value={availablePickups}
        trend={availablePickups > 0 ? `${availablePickups} waiting` : undefined}
        trendUp={false}
        Icon={PackageCheck} iconGradient="from-amber-400 to-orange-500"
        href="/dashboard/pickups"
      />
      <StatCard
        label="Active Deliveries" sub="On-route now"
        value={activeDeliveries}
        trend={activeDeliveries > 0 ? "In progress" : undefined}
        trendUp={true}
        Icon={Truck} iconGradient="from-blue-600 to-indigo-600"
        href="/dashboard/deliveries"
      />
      <StatCard
        label="Completed Today" sub="Successfully delivered"
        value={completedToday}
        trend={completedToday > 0 ? `+${completedToday} today` : undefined}
        trendUp={true}
        Icon={CheckCircle2} iconGradient="from-emerald-500 to-teal-600"
        href="/dashboard/history"
      />
      <StatCard
        label="Assigned Zones" sub="Route coverage"
        value={assignedRoutes > 0 ? `${assignedRoutes} zones` : totalDeliveries || "—"}
        Icon={Navigation} iconGradient="from-cyan-500 to-blue-600"
        href="/dashboard/agent-routes"
      />
    </div>
  );
}
