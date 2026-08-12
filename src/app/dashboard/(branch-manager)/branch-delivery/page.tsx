"use client";

import { AdminCrudPage } from "@/components/shared/admin-crud";
import { deliveryAgentConfig } from "@/components/dashboard/(agent)/deliveryAgentsConfig";
import { Truck } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

export default function DeliveryAgentsPage() {
  return (
    <div className="space-y-7">
      <DashboardPageHero
        badge="Branch Manager Portal"
        title="Delivery Agents"
        description="Manage delivery agents assigned to this branch for pickups and drop-offs."
        icon={Truck}
      />
      <AdminCrudPage config={deliveryAgentConfig} hideHeader />
    </div>
  );
}
