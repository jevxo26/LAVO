import { z } from "zod"
import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type BranchInventoryRecord = {
  id: string
  itemName: string
  quantity: number
  unit: string
  status: string
}

export const branchInventorySchema = z.object({
  id: z.string().optional(),
  itemName: z.string().min(2, "Item name is required"),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  status: z.string().min(1, "Status is required"),
})

export const branchInventoryConfig: CrudModuleConfig<BranchInventoryRecord> = {
  title: "Branch Inventory",
  description: "Track detergents, packaging materials, and stock.",
  createLabel: "Add Item",
  searchPlaceholder: "Search inventory...",
  emptyTitle: "No inventory items found",
  emptyDescription: "Add items to start tracking your branch stock.",
  schema: branchInventorySchema,
  endpoint: "/api/branch-dashboard/inventory",
  columns: [
    { accessorKey: "id", header: "Item Code", kind: "id" },
    { accessorKey: "itemName", header: "Item Name" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unit", header: "Unit" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "itemName", label: "Item Name", placeholder: "e.g., Detergent A" },
    { name: "quantity", label: "Quantity", type: "number", placeholder: "100" },
    { name: "unit", label: "Unit", placeholder: "kg, liters, pcs" },
    { name: "status", label: "Status", options: ["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK"] },
  ],
  getRowLabel: (row) => row.itemName,
}
