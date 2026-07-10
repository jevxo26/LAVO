import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type DeliveryAgentRecord = {
  id: string
  name: string
  phone: string
  zone: string
  status: string
}

export type VehicleRecord = {
  id: string
  vehicleNumber: string
  type: string
  assignedAgent: string
  status: string
}

export const deliveryAgentSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Phone is required"),
  zone: z.string().min(1, "Zone is required"),
  status: z.string().min(1, "Status is required"),
})

export const vehicleSchema = z.object({
  id: z.string().min(1, "Vehicle ID is required"),
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
  type: z.string().min(1, "Type is required"),
  assignedAgent: z.string().min(2, "Assigned agent is required"),
  status: z.string().min(1, "Status is required"),
})

export const deliveryAgentConfig: CrudModuleConfig<DeliveryAgentRecord> = {
  title: "Delivery Agents",
  description: "Manage delivery agent availability and coverage zones.",
  createLabel: "Create Agent",
  searchPlaceholder: "Search agents...",
  emptyTitle: "No delivery agents found",
  emptyDescription: "Create an agent or adjust the search query.",
  schema: deliveryAgentSchema,
  endpoint: "/api/logistics/agents",
  columns: [
    { accessorKey: "id", header: "Agent ID", kind: "id" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "zone", header: "Zone" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Agent ID", placeholder: "AG-404" },
    { name: "name", label: "Name", placeholder: "Agent name" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+880..." },
    { name: "zone", label: "Zone", placeholder: "Coverage zone" },
    { name: "status", label: "Status", options: ["Active", "Inactive", "Suspended"] },
  ],
  getRowLabel: (row) => row.name,
}

export const vehicleConfig: CrudModuleConfig<VehicleRecord> = {
  title: "Vehicles",
  description: "Track delivery vehicles, assignments, and fleet status.",
  createLabel: "Create Vehicle",
  searchPlaceholder: "Search vehicles...",
  emptyTitle: "No vehicles found",
  emptyDescription: "Create a vehicle or adjust the search query.",
  schema: vehicleSchema,
  endpoint: "/api/logistics/vehicles",
  columns: [
    { accessorKey: "id", header: "Vehicle ID", kind: "id" },
    { accessorKey: "vehicleNumber", header: "Vehicle Number" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "assignedAgent", header: "Assigned Agent" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Vehicle ID", placeholder: "VH-504" },
    { name: "vehicleNumber", label: "Vehicle Number", placeholder: "DHA-00-0000" },
    { name: "type", label: "Type", options: ["Bike", "Van", "Truck"] },
    { name: "assignedAgent", label: "Assigned Agent", placeholder: "Agent name" },
    { name: "status", label: "Status", options: ["Active", "Inactive", "Maintenance"] },
  ],
  getRowLabel: (row) => row.vehicleNumber,
}
