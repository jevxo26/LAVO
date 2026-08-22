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

// ─── Auth-loading skeleton ────────────────────────────────────────────────────
// Shown while useAuth() resolves — mirrors the general overview layout so
// there is no blank flash before the role-specific overview mounts.

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800 ${className ?? ""}`} />;
}

function DashboardAuthSkeleton() {
  return (
    <div className="space-y-7">
      {/* Hero banner */}
      <Sk className="h-52 w-full rounded-3xl" />
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-32" />)}
      </div>
      {/* Main content + sidebar */}
      <div className="grid gap-6 md:grid-cols-6">
        <Sk className="md:col-span-4 h-80" />
        <div className="md:col-span-2 space-y-4">
          <Sk className="h-36" />
          <Sk className="h-36" />
        </div>
      </div>
    </div>
  );
}

// ─── Role normalizer ──────────────────────────────────────────────────────────

function normalizeRole(raw: string): string {
  const r = raw.toUpperCase().trim().replace(/[\s-]+/g, "_");

  if (["AGENT", "DELIVERYAGENT", "DELIVERY_AGENT"].includes(r)) return "DELIVERY_AGENT";
  if (["MANAGER", "BRANCHMANAGER", "BRANCH_MANAGER"].includes(r)) return "BRANCH_MANAGER";
  if (["STAFF", "BRANCH_EMPLOYEE", "BRANCHEMPLOYEE", "EMPLOYEE"].includes(r)) return "EMPLOYEE";
  if (["VENDOR_OWNER", "VENDOROWNER", "VENDOR_STAFF", "VENDORSTAFF", "VENDOR"].includes(r)) return "VENDOR";
  if (["SUPER_ADMIN", "SUPERADMIN", "SUPER_ADMINISTRATOR", "SUPERADMINISTRATOR"].includes(r)) return "SUPER_ADMIN";
  if (["ADMIN", "ADMINISTRATOR", "NORMAL_ADMIN", "SYSTEM_ADMIN", "ADMIN_USER"].includes(r)) return "ADMIN";
  if (["CUSTOMER", "USER"].includes(r)) return "CUSTOMER";

  return r;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardRootPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <DashboardAuthSkeleton />;

  const rawRole = (user as any)?.role || (user as any)?.userType || "";
  const role = normalizeRole(rawRole);

  switch (role) {
    case "SUPER_ADMIN":    return <SuperAdminOverview />;
    case "ADMIN":          return <NormalAdminOverview />;
    case "BRANCH_MANAGER": return <BranchManagerOverview />;
    case "VENDOR":         return <VendorOverview />;
    case "EMPLOYEE":       return <EmployeeOverview />;
    case "DELIVERY_AGENT": return <AgentOverview />;
    case "CUSTOMER":       return <CustomerOverview />;
    default:               return <NormalAdminOverview />;
  }
}
