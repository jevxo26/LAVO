"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { branchInventoryConfig } from "@/components/branch-dashboard/inventoryConfig"

export default function BranchInventoryPage() {
  return <AdminCrudPage config={branchInventoryConfig} />
}
