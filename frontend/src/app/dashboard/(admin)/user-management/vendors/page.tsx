"use client";

import React from "react";
import { UserManagementTable, UserRow } from "@/components/dashboard/shared/UserManagementTable";

const initialVendors: UserRow[] = [
  { id: "VND-01", fullName: "Apex Cleaners Ltd. (Rep)", email: "contact@apexcleaners.com", phone: "+8801900334455", role: "VENDOR", status: "ACTIVE", createdAt: "2026-02-01" },
  { id: "VND-02", fullName: "Royal Wash & Press Co. (Rep)", email: "info@royalwash.com", phone: "+8801600445566", role: "VENDOR", status: "ACTIVE", createdAt: "2026-02-20" },
];

export default function VendorsManagementPage() {
  return (
    <UserManagementTable
      title="Vendor Management"
      description="Manage marketplace vendor partners, contracts, and marketplace access."
      roleFilter="Vendor"
      initialUsers={initialVendors}
    />
  );
}
