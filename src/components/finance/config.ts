import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type TaxRuleRecord = {
  id: string
  ruleName: string
  region: string
  rate: number
  status: string
}

export type DeliveryChargeRecord = {
  id: string
  ruleName: string
  zone: string
  charge: number
  status: string
}

export const taxRuleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  ruleName: z.string().min(2, "Rule name is required"),
  region: z.string().min(1, "Region is required"),
  rate: z.coerce.number().min(0).max(100),
  status: z.string().min(1, "Status is required"),
})

export const deliveryChargeSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  ruleName: z.string().min(2, "Rule name is required"),
  zone: z.string().min(1, "Zone is required"),
  charge: z.coerce.number().min(0),
  status: z.string().min(1, "Status is required"),
})

export const taxRuleConfig: CrudModuleConfig<TaxRuleRecord> = {
  title: "Tax Rules",
  description: "Configure tax rules by service region.",
  createLabel: "Create Tax Rule",
  searchPlaceholder: "Search tax rules...",
  emptyTitle: "No tax rules found",
  emptyDescription: "Create a tax rule or adjust the search query.",
  schema: taxRuleSchema,
  endpoint: "/api/finance/taxes",
  columns: [
    { accessorKey: "id", header: "Rule ID", kind: "id" },
    { accessorKey: "ruleName", header: "Rule Name" },
    { accessorKey: "region", header: "Region" },
    { accessorKey: "rate", header: "Rate", kind: "percent" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Rule ID", placeholder: "TAX-603" },
    { name: "ruleName", label: "Rule Name", placeholder: "Tax rule name" },
    { name: "region", label: "Region", placeholder: "Region" },
    { name: "rate", label: "Rate", type: "number", placeholder: "5" },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ],
  getRowLabel: (row) => row.ruleName,
}

export const deliveryChargeConfig: CrudModuleConfig<DeliveryChargeRecord> = {
  title: "Delivery Charge Rules",
  description: "Manage delivery fee rules by service zone.",
  createLabel: "Create Charge Rule",
  searchPlaceholder: "Search charge rules...",
  emptyTitle: "No charge rules found",
  emptyDescription: "Create a charge rule or adjust the search query.",
  schema: deliveryChargeSchema,
  endpoint: "/api/finance/delivery-charges",
  columns: [
    { accessorKey: "id", header: "Rule ID", kind: "id" },
    { accessorKey: "ruleName", header: "Rule Name" },
    { accessorKey: "zone", header: "Zone" },
    { accessorKey: "charge", header: "Charge", kind: "currency" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Rule ID", placeholder: "DCR-703" },
    { name: "ruleName", label: "Rule Name", placeholder: "Charge rule name" },
    { name: "zone", label: "Zone", placeholder: "Zone" },
    { name: "charge", label: "Charge", type: "number", placeholder: "60" },
    { name: "status", label: "Status", options: ["Active", "Inactive"] },
  ],
  getRowLabel: (row) => row.ruleName,
}
