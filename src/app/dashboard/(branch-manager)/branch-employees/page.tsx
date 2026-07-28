"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { branchEmployeeConfig } from "@/components/dashboard/(branch-manager)/employeesConfig"

export default function BranchEmployeesPage() {
  return <AdminCrudPage config={branchEmployeeConfig} />
}
