"use client";

import Link from "next/link";
import { PackageCheck, Truck, CheckCircle2, Navigation } from "lucide-react";
import { OverviewStatCard } from "@/components/dashboard/shared/overview/OverviewStatCard";

interface Props {
  availablePickups: number;
  activeDeliveries: number;
  completedToday:   number;
  assignedRoutes:   number;
  totalDeliveries:  number;
}

export function AgentStatCards({ availablePickups, activeDeliveries, completedToday, assignedRoutes, totalDeliveries }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Link href="/dashboard/pickups">
        <OverviewStatCard label="Available Pickups" sub="Pending collection"    value={availablePickups}  icon={PackageCheck} gradient="from-amber-400 to-orange-500"  />
      </Link>
      <Link href="/dashboard/deliveries">
        <OverviewStatCard label="Active Deliveries" sub="On-route now"          value={activeDeliveries}  icon={Truck}        gradient="from-blue-500 to-indigo-600"    />
      </Link>
      <Link href="/dashboard/history">
        <OverviewStatCard label="Completed Today"   sub="Successfully delivered" value={completedToday}   icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"   />
      </Link>
      <Link href="/dashboard/agent-routes">
        <OverviewStatCard
          label="Assigned Zones" sub="Route coverage"
          value={assignedRoutes > 0 ? `${assignedRoutes} zones` : (totalDeliveries || "—")}
          icon={Navigation} gradient="from-cyan-500 to-blue-600"
        />
      </Link>
    </div>
  );
}
