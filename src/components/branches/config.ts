import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type BranchRecord = {
  id: string
  branchName: string
  manager: string
  contact: string
  status: string
}

export const branchSchema = z.object({
  id: z.string().optional(),
  branchName: z.string().min(2, "Branch name is required"),
  manager: z.string().min(2, "Manager is required"),
  contact: z.string().min(6, "Contact is required"),
  status: z.string().min(1, "Status is required"),
})

export const branchConfig: CrudModuleConfig<BranchRecord> = {
  title: "Branches",
  description: "Maintain branch profiles, managers, and operational status.",
  createLabel: "Create Branch",
  searchPlaceholder: "Search branches...",
  emptyTitle: "No branches found",
  emptyDescription: "Create a branch or adjust the search query.",
  schema: branchSchema,
  endpoint: "/api/branches",
  columns: [
    { accessorKey: "id", header: "Branch Code", kind: "id" },
    { accessorKey: "branchName", header: "Branch Name" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "manager", header: "Manager" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "branchName", label: "Branch Name", placeholder: "Branch name" },
    { name: "location", label: "Location", placeholder: "Full address" },
    { name: "contact", label: "Contact", type: "tel", placeholder: "+880..." },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ],
  getRowLabel: (row) => row.branchName,
}
