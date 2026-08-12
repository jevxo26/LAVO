"use client";

import { AdminCrudPage } from "@/components/shared/admin-crud";
import { branchInventoryConfig } from "@/components/dashboard/(branch-manager)/inventoryConfig";
import { Package } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

export default function BranchInventoryPage() {
  return (
    <div className="space-y-7">
      <DashboardPageHero
        badge="Branch Manager Portal"
        title="Branch Inventory"
        description="Track detergents, packaging materials, and branch stock levels."
        icon={Package}
      />
      <AdminCrudPage config={branchInventoryConfig} hideHeader />
    </div>
  );
}
