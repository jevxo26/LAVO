"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { branchConfig } from "@/components/branches/config"

export function BranchTable() {
  return <AdminCrudPage config={branchConfig} />
}
