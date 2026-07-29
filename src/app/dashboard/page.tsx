"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CustomerOverview } from "@/components/dashboard/(customer)/overview/CustomerOverview";
import { SuperAdminOverview } from "@/components/dashboard/shared/overview/SuperAdminOverview";
import { NormalAdminOverview } from "@/components/dashboard/shared/overview/NormalAdminOverview";
import { BranchManagerOverview } from "@/components/dashboard/(branch-manager)/overview/BranchManagerOverview";
import { VendorOverview } from "@/components/dashboard/(vendor)/overview/VendorOverview";
import { AgentOverview } from "@/components/dashboard/(agent)/overview/AgentOverview";
import { EmployeeOverview } from "@/components/dashboard/(employee)/overview/EmployeeOverview";

export default function DashboardPage() {
  const { user } = useAuth();
  const role = (user?.userType || (user as any)?.role || "").toUpperCase().replace(/\s+/g, "_");

  switch (role) {
    case "CUSTOMER":
      return <CustomerOverview />;
    case "SUPER_ADMIN":
      return <SuperAdminOverview />;
    case "ADMIN":
      return <NormalAdminOverview />;
    case "BRANCH_MANAGER":
      return <BranchManagerOverview />;
    case "VENDOR":
      return <VendorOverview />;
    case "EMPLOYEE":
      return <EmployeeOverview />;
    case "DELIVERY_AGENT":
    case "AGENT":
      return <AgentOverview />;
    default:
      return <CustomerOverview />;
  }
}
