import { z } from "zod"
import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type DeliveryAgentRecord = {
  id: string
  employeeCode: string
  phone: string
  availability: boolean
  status: string
  user?: {
    fullName: string
    email: string
  }
}

export const deliveryAgentSchema = z.object({
  id: z.string().optional(),
  employeeCode: z.string().min(2, "Employee code is required"),
  phone: z.string().min(6, "Phone is required"),
  availability: z.boolean(),
  status: z.string().min(1, "Status is required"),
})

export const deliveryAgentConfig: CrudModuleConfig<DeliveryAgentRecord> = {
  title: "Delivery Agents",
  description: "View and manage delivery agents assigned to your zone.",
  createLabel: "Add Agent",
  searchPlaceholder: "Search agents...",
  emptyTitle: "No delivery agents found",
  emptyDescription: "No delivery agents are currently available in your zone.",
  schema: deliveryAgentSchema,
  endpoint: "/api/branch-dashboard/delivery-agents",
  columns: [
    { accessorKey: "id", header: "Agent ID", kind: "id" },
    { accessorKey: "user.fullName" as any, header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "availability", header: "Available", kind: "status" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "employeeCode", label: "Employee Code", placeholder: "e.g., AGT-101" },
    { name: "phone", label: "Phone", placeholder: "+880..." },
    { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE"] },
  ],
  getRowLabel: (row) => row.user?.fullName || row.employeeCode,
}
