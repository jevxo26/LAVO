"use client";

import React from "react";
import { UserManagementTable, UserRow } from "@/components/dashboard/shared/UserManagementTable";

const initialManagers: UserRow[] = [
  { id: "MGR-01", fullName: "Kazi Nabil", email: "nabil.mgr@laundrix.com", phone: "+8801700998877", role: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-01" },
  { id: "MGR-02", fullName: "Tanvir Ahmed", email: "tanvir.mgr@laundrix.com", phone: "+8801800112233", role: "BRANCH_MANAGER", status: "ACTIVE", createdAt: "2026-01-15" },
];

export default function BranchManagersManagementPage() {
  return (
    <UserManagementTable
      title="Branch Manager Management"
      description="Manage branch manager roles, hub assignments, and operational permissions."
      roleFilter="Branch Manager"
      initialUsers={initialManagers}
    />
  );
}
