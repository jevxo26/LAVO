import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type VendorRecord = {
  id: string
  vendorName: string
  owner: string
  commission: number
  rating: number
  status: string
}

export const vendorSchema = z.object({
  id: z.string().min(1, "Vendor ID is required"),
  vendorName: z.string().min(2, "Vendor name is required"),
  owner: z.string().min(2, "Owner is required"),
  commission: z.coerce.number().min(0).max(100),
  rating: z.coerce.number().min(0).max(5),
  status: z.string().min(1, "Status is required"),
})

export const vendorConfig: CrudModuleConfig<VendorRecord> = {
  title: "Vendors",
  description: "Track vendor partners, commercial terms, and ratings.",
  createLabel: "Create Vendor",
  searchPlaceholder: "Search vendors...",
  emptyTitle: "No vendors found",
  emptyDescription: "Create a vendor or adjust the search query.",
  schema: vendorSchema,
  endpoint: "/api/vendors",
  columns: [
    { accessorKey: "vendorName", header: "Vendor Name" },
    { accessorKey: "owner", header: "Owner" },
    { accessorKey: "commission", header: "Commission", kind: "percent" },
    { accessorKey: "rating", header: "Rating", kind: "rating" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Vendor ID", placeholder: "VEN-204" },
    { name: "vendorName", label: "Vendor Name", placeholder: "Vendor name" },
    { name: "owner", label: "Owner", placeholder: "Owner name" },
    { name: "commission", label: "Commission", type: "number", placeholder: "12" },
    { name: "rating", label: "Rating", type: "number", placeholder: "4.5" },
    { name: "status", label: "Status", options: ["Active", "Pending", "Inactive"] },
  ],
  getRowLabel: (row) => row.vendorName,
}
