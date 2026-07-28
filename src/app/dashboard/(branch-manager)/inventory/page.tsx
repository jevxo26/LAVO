"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { branchInventoryConfig } from "@/components/dashboard/(branch-manager)/inventoryConfig"

export default function BranchInventoryPage() {
  return <AdminCrudPage config={branchInventoryConfig} />
}
