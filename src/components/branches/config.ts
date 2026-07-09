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
  id: z.string().min(1, "Branch code is required"),
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
  data: [
    { id: "BR-DHK-01", branchName: "Dhanmondi Hub", manager: "Arif Hasan", contact: "+8801811002001", status: "Active" },
    { id: "BR-CTG-02", branchName: "Chattogram Central", manager: "Rafi Karim", contact: "+8801811002002", status: "Active" },
    { id: "BR-SYL-03", branchName: "Sylhet North", manager: "Farhana Zaman", contact: "+8801811002003", status: "Inactive" },
  ],
  columns: [
    { accessorKey: "id", header: "Branch Code" },
    { accessorKey: "branchName", header: "Branch Name" },
    { accessorKey: "manager", header: "Manager" },
    { accessorKey: "contact", header: "Contact" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Branch Code", placeholder: "BR-DHK-04" },
    { name: "branchName", label: "Branch Name", placeholder: "Branch name" },
    { name: "manager", label: "Manager", placeholder: "Manager name" },
    { name: "contact", label: "Contact", type: "tel", placeholder: "+880..." },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ],
  getRowLabel: (row) => row.branchName,
}
