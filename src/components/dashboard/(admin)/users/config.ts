import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type UserRecord = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
}

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.email("Valid email is required"),
  phone: z.string().min(6, "Phone is required"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
})

export const userConfig: CrudModuleConfig<UserRecord> = {
  title: "Users",
  description: "Manage platform users, roles, and account status.",
  createLabel: "Create User",
  searchPlaceholder: "Search users...",
  emptyTitle: "No users found",
  emptyDescription: "Create a user or adjust the search query.",
  schema: userSchema,
  endpoint: "/api/users",
  columns: [
    { accessorKey: "id", header: "ID", kind: "id" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "role", header: "Role" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "name", label: "Name", placeholder: "Full name" },
    { name: "email", label: "Email", type: "email", placeholder: "Email address" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+880..." },
    { name: "role", label: "Role", options: ["Admin", "Branch Manager", "Support", "Delivery Agent", "Customer"] },
    { name: "status", label: "Status", options: ["Active", "Inactive", "Suspended"] },
  ],
  getRowLabel: (row) => row.name,
}
