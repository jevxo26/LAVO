"use client";

import React from "react";
import { AdminPermissionControl } from "@/components/dashboard/rbac/AdminPermissionControl";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { ShieldCheck } from "lucide-react";

export default function AdminPermissionsPage() {
  return (
    <PermissionGuard superAdminOnly>
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Permission Control</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage operational permissions and toggle access flags for Normal Admins.</p>
          </div>
        </div>

        <AdminPermissionControl />
      </div>
    </PermissionGuard>
  );
}
