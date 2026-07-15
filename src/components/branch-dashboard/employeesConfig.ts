import { z } from "zod"
import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type BranchEmployeeRecord = {
  id: string
  employeeId: string
  designation: string
  status: string
  user?: {
    fullName: string
    email: string
  }
}

export const branchEmployeeSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee is required"),
  designation: z.string().min(2, "Designation is required"),
  status: z.string().min(1, "Status is required"),
})

export const branchEmployeeConfig: CrudModuleConfig<BranchEmployeeRecord> = {
  title: "Branch Employees",
  description: "Manage branch staff and operational personnel.",
  createLabel: "Add Employee",
  searchPlaceholder: "Search employees...",
  emptyTitle: "No employees found",
  emptyDescription: "Add a staff member to your branch.",
  schema: branchEmployeeSchema,
  endpoint: "/api/branch-dashboard/employees",
  columns: [
    { accessorKey: "id", header: "Employee ID", kind: "id" },
    { accessorKey: "user.fullName" as any, header: "Name" },
    { accessorKey: "user.email" as any, header: "Email" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "employeeId", label: "User ID", placeholder: "System User ID" },
    { name: "designation", label: "Designation", placeholder: "Washer, Manager, etc." },
    { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE"] },
  ],
  getRowLabel: (row) => row.user?.fullName || row.id,
}
