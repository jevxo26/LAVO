import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type ServiceRecord = {
  id: string
  itemName: string
  category: string
  washPrice: number
  dryCleanPrice: number
  status: string
}

export const serviceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  itemName: z.string().min(2, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  washPrice: z.coerce.number().min(0),
  dryCleanPrice: z.coerce.number().min(0),
  status: z.string().min(1, "Status is required"),
})

export const serviceConfig: CrudModuleConfig<ServiceRecord> = {
  title: "Laundry Services",
  description: "Configure laundry items, categories, and service pricing.",
  createLabel: "Create Service",
  searchPlaceholder: "Search services...",
  emptyTitle: "No services found",
  emptyDescription: "Create a service or adjust the search query.",
  schema: serviceSchema,
  endpoint: "/api/services",
  columns: [
    { accessorKey: "itemName", header: "Item Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "washPrice", header: "Wash Price", kind: "currency" },
    { accessorKey: "dryCleanPrice", header: "Dry Clean Price", kind: "currency" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Service ID", placeholder: "SVC-304" },
    { name: "itemName", label: "Item Name", placeholder: "Item name" },
    { name: "category", label: "Category", options: ["Men", "Women", "Household", "Premium", "Kids"] },
    { name: "washPrice", label: "Wash Price", type: "number", placeholder: "80" },
    { name: "dryCleanPrice", label: "Dry Clean Price", type: "number", placeholder: "160" },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ],
  getRowLabel: (row) => row.itemName,
}
