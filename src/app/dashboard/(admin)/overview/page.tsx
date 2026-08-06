"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { SuperAdminOverview } from "@/components/dashboard/shared/overview/SuperAdminOverview";
import { NormalAdminOverview } from "@/components/dashboard/shared/overview/NormalAdminOverview";

export default function AdminOverviewPage() {
  const { user } = useAuth();

  const isSuperAdmin =
    (user?.userType || "").toUpperCase() === "SUPER_ADMIN";

  return isSuperAdmin ? <SuperAdminOverview /> : <NormalAdminOverview />;
}
