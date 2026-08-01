"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { SuperAdminOverview } from "@/components/dashboard/shared/overview/SuperAdminOverview";
import { NormalAdminOverview } from "@/components/dashboard/shared/overview/NormalAdminOverview";
import { BranchManagerOverview } from "@/components/dashboard/(branch-manager)/overview/BranchManagerOverview";
import { VendorOverview } from "@/components/dashboard/(vendor)/overview/VendorOverview";
import { EmployeeOverview } from "@/components/dashboard/(employee)/overview/EmployeeOverview";
import { AgentOverview } from "@/components/dashboard/(agent)/overview/AgentOverview";
import { CustomerOverview } from "@/components/dashboard/(customer)/overview/CustomerOverview";

/** Normalize raw role string from JWT to a canonical role key */
function normalizeRole(raw: string): string {
  const r = raw.toUpperCase().trim().replace(/[\s-]+/g, "_");

  if (["AGENT", "DELIVERYAGENT", "DELIVERY_AGENT"].includes(r)) return "DELIVERY_AGENT";
  if (["MANAGER", "BRANCHMANAGER", "BRANCH_MANAGER"].includes(r)) return "BRANCH_MANAGER";
  if (["STAFF", "BRANCH_EMPLOYEE", "BRANCHEMPLOYEE", "EMPLOYEE"].includes(r)) return "EMPLOYEE";
  if (["VENDOR_OWNER", "VENDOROWNER", "VENDOR_STAFF", "VENDORSTAFF", "VENDOR"].includes(r)) return "VENDOR";
  if (["SUPERADMIN", "SUPER_ADMIN"].includes(r)) return "SUPER_ADMIN";
  if (["CUSTOMER", "USER"].includes(r)) return "CUSTOMER";
  if (r === "ADMIN") return "ADMIN";

  return r;
}

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const rawRole = (user as any)?.role || (user as any)?.userType || "";
  const role = normalizeRole(rawRole);

  switch (role) {
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
      return <AgentOverview />;
    case "CUSTOMER":
      return <CustomerOverview />;
    default:
      return <NormalAdminOverview />;
  }
}
