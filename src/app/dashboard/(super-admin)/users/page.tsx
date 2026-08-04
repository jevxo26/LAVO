"use client";

import React from "react";
import { UserManagementTable } from "@/components/dashboard/shared/UserManagementTable";

export default function UsersPage() {
  return (
    <UserManagementTable
      title="All System Users Directory"
      description="Overview and governance of all user accounts across all platform roles."
      roleFilter=""
    />
  );
}
