"use client"

import { AdminCrudPage } from "@/components/shared/admin-crud"
import { branchEmployeeConfig } from "@/components/branch-dashboard/employeesConfig"

export default function BranchEmployeesPage() {
  return <AdminCrudPage config={branchEmployeeConfig} />
}
