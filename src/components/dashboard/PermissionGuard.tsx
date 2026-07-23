"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionGuardProps {
  children: React.ReactNode;
  superAdminOnly?: boolean;
  permissionFlag?:
    | "canManageCustomerOps"
    | "canManageBranchOps"
    | "canManageVendorOps"
    | "canManageAgentOps"
    | "canManageEmployeeOps"
    | "canManageFinance";
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard Component
 * Wraps UI elements (e.g., Edit/Delete/Ban buttons) so they only render if user is SUPER_ADMIN
 * or has the specific dynamic boolean flag enabled.
 */
export function PermissionGuard({
  children,
  superAdminOnly = false,
  permissionFlag,
  fallback = null,
}: PermissionGuardProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  const role = (user.userType || (user as any).role || "").toUpperCase();
  const isSuperAdmin = role === "SUPER_ADMIN";

  // SUPER_ADMIN unconditionally passes all guards
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // If component requires SUPER_ADMIN strictly, hide from normal ADMIN
  if (superAdminOnly) {
    return <>{fallback}</>;
  }

  // Check specific boolean permission flag if provided
  if (permissionFlag) {
    const userPerms = (user as any).adminPermission || {};
    const isPermitted = !!userPerms[permissionFlag];
    return isPermitted ? <>{children}</> : <>{fallback}</>;
  }

  return <>{children}</>;
}
