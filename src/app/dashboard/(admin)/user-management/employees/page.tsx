"use client";

import React from "react";
import { UserManagementTable, UserRow } from "@/components/dashboard/shared/UserManagementTable";

const initialEmployees: UserRow[] = [
  { id: "EMP-01", fullName: "Abul Kalam", email: "abul.emp@laundrix.com", phone: "+8801500112233", role: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-02-10" },
  { id: "EMP-02", fullName: "Nasrin Sultana", email: "nasrin.emp@laundrix.com", phone: "+8801600223344", role: "EMPLOYEE", status: "ACTIVE", createdAt: "2026-03-01" },
];

export default function EmployeesManagementPage() {
  return (
    <UserManagementTable
      title="Branch Employee Management"
      description="Manage branch laundry technicians, intake operators, and shift schedules."
      roleFilter="Employee"
      initialUsers={initialEmployees}
    />
  );
}
