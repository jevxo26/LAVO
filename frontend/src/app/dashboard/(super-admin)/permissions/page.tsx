"use client";

import React from "react";
import { AdminPermissionControl } from "@/components/dashboard/shared/rbac/AdminPermissionControl";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import { ShieldCheck } from "lucide-react";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";

export default function AdminPermissionsPage() {
  return (
    <PermissionGuard superAdminOnly>
      <div className="space-y-6">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <DashboardPageHero
          badge="Super Admin — Access Control"
          title="Admin Permission Control"
          description="Manage operational permissions and toggle module access flags for Normal Admins in real time."
          icon={ShieldCheck}
          liveLabel="Super Admin Only"
        />

        <AdminPermissionControl />
      </div>
    </PermissionGuard>
  );
}
