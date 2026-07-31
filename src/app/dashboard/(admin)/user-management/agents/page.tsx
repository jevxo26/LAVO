"use client";

import React from "react";
import { UserManagementTable, UserRow } from "@/components/dashboard/shared/UserManagementTable";

const initialAgents: UserRow[] = [
  { id: "AG-01", fullName: "Kamal Hossain", email: "kamal.agent@laundrix.com", phone: "+8801711223344", role: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-01" },
  { id: "AG-02", fullName: "Rafiqul Islam", email: "rafiqul.agent@laundrix.com", phone: "+8801819887766", role: "DELIVERY_AGENT", status: "ACTIVE", createdAt: "2026-03-10" },
];

export default function AgentsManagementPage() {
  return (
    <UserManagementTable
      title="Delivery Agent Management"
      description="Manage logistics delivery agents, vehicle assignments, and zone access."
      roleFilter="Delivery Agent"
      initialUsers={initialAgents}
    />
  );
}
