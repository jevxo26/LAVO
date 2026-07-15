import { z } from "zod"
import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type BranchEmployeeRecord = {
  id: string
  employeeId: string
  designation: string
  status: string
  fullName?: string
  email?: string
}

export const branchEmployeeSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
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
    { accessorKey: "fullName", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "designation", header: "Designation" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "fullName", label: "Full Name", placeholder: "e.g., John Doe" },
    { name: "email", label: "Email Address", placeholder: "john@lavo.com" },
    { name: "designation", label: "Designation", placeholder: "Washer, Manager, etc." },
    { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE"] },
  ],
  getRowLabel: (row) => row.fullName || row.id,
}
