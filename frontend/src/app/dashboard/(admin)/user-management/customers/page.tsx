"use client";

import React from "react";
import { UserManagementTable, UserRow } from "@/components/dashboard/shared/UserManagementTable";

const initialCustomers: UserRow[] = [
  { id: "CUST-01", fullName: "Sarah Jenkins", email: "sarah@example.com", phone: "+8801711998877", role: "CUSTOMER", status: "ACTIVE", createdAt: "2026-01-10" },
  { id: "CUST-02", fullName: "David Miller", email: "david@example.com", phone: "+8801819223344", role: "CUSTOMER", status: "ACTIVE", createdAt: "2026-02-14" },
  { id: "CUST-03", fullName: "Elena Rostova", email: "elena@example.com", phone: "+8801911445566", role: "CUSTOMER", status: "ACTIVE", createdAt: "2026-03-05" },
];

export default function CustomersManagementPage() {
  return (
    <UserManagementTable
      title="Customer User Management"
      description="Manage customer accounts, verify profiles, and enforce access controls."
      roleFilter="Customer"
      initialUsers={initialCustomers}
    />
  );
}
