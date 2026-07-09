import { z } from "zod"

import { type CrudModuleConfig } from "@/components/shared/admin-crud"

export type SupportTicketRecord = {
  id: string
  customer: string
  subject: string
  priority: string
  status: string
}

export type ReviewRecord = {
  id: string
  customer: string
  rating: number
  comment: string
  status: string
}

export const supportTicketSchema = z.object({
  id: z.string().min(1, "Ticket ID is required"),
  customer: z.string().min(2, "Customer is required"),
  subject: z.string().min(2, "Subject is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
})

export const reviewSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
  customer: z.string().min(2, "Customer is required"),
  rating: z.coerce.number().min(0).max(5),
  comment: z.string().min(2, "Comment is required"),
  status: z.string().min(1, "Status is required"),
})

export const supportTicketConfig: CrudModuleConfig<SupportTicketRecord> = {
  title: "Support Tickets",
  description: "Reply to tickets and manage customer support status.",
  createLabel: "Create Reply",
  searchPlaceholder: "Search tickets...",
  emptyTitle: "No tickets found",
  emptyDescription: "Create a ticket reply or adjust the search query.",
  schema: supportTicketSchema,
  endpoint: "/api/support/tickets",
  columns: [
    { accessorKey: "id", header: "Ticket ID" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "subject", header: "Subject" },
    { accessorKey: "priority", header: "Priority" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Ticket ID", placeholder: "TCK-804" },
    { name: "customer", label: "Customer", placeholder: "Customer name" },
    { name: "subject", label: "Subject", placeholder: "Ticket subject" },
    { name: "priority", label: "Priority", options: ["Low", "Medium", "High"] },
    { name: "status", label: "Status", options: ["Open", "Pending", "Resolved"] },
  ],
  getRowLabel: (row) => row.subject,
}

export const reviewConfig: CrudModuleConfig<ReviewRecord> = {
  title: "Reviews",
  description: "Moderate customer reviews and publication status.",
  createLabel: "Create Review",
  searchPlaceholder: "Search reviews...",
  emptyTitle: "No reviews found",
  emptyDescription: "Create a review or adjust the search query.",
  schema: reviewSchema,
  endpoint: "/api/support/reviews",
  columns: [
    { accessorKey: "id", header: "Review ID" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "rating", header: "Rating", kind: "rating" },
    { accessorKey: "comment", header: "Comment" },
    { accessorKey: "status", header: "Status", kind: "status" },
  ],
  fields: [
    { name: "id", label: "Review ID", placeholder: "REV-904" },
    { name: "customer", label: "Customer", placeholder: "Customer name" },
    { name: "rating", label: "Rating", type: "number", placeholder: "5" },
    { name: "comment", label: "Comment", placeholder: "Review comment" },
    { name: "status", label: "Status", options: ["Published", "Pending", "Hidden"] },
  ],
  getRowLabel: (row) => row.comment,
}
