"use client";

import { AdminCrudPage } from "@/components/shared/admin-crud";
import { branchEmployeeConfig } from "@/components/dashboard/(branch-manager)/employeesConfig";
import { Users } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

export default function BranchEmployeesPage() {
  return (
    <div className="space-y-7">
      <DashboardPageHero
        badge="Branch Manager Portal"
        title="Branch Employees"
        description="Manage branch staff, designations, and operational personnel."
        icon={Users}
      />
      <AdminCrudPage config={branchEmployeeConfig} hideHeader />
    </div>
  );
}
