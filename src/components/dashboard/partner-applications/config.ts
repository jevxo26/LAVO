import { z } from "zod";
import { type CrudModuleConfig } from "@/components/shared/admin-crud";

export type PartnerApplicationRecord = {
  id: string;
  phone: string;
  targetCity: string;
  experience: string | null;
  reason: string;

  status: "PENDING" | "APPROVED" | "REJECTED";

  createdAt: string;

  user: {
    fullName: string;
    email: string;
  };
};


export const partnerApplicationSchema = z.object({
  id: z.string().optional(),

  phone: z.string(),

  targetCity: z.string(),

  experience: z.string().optional(),

  reason: z.string(),

  status: z.enum([
    "PENDING",
    "APPROVED",
    "REJECTED",
  ]),
});


export const partnerApplicationConfig:
CrudModuleConfig<PartnerApplicationRecord> = {

  title: "Partner Applications",

  description:
    "Review vendor partnership requests.",

  createLabel:
    "Review Application",

  searchPlaceholder:
    "Search applications...",

  emptyTitle:
    "No partner applications found",

  emptyDescription:
    "New partner requests will appear here.",


  schema:
    partnerApplicationSchema,


  endpoint:
    "/api/partner-applications",


  columns: [

    {
      accessorKey: "user",
      header: "Applicant",
    },

    {
      accessorKey: "phone",
      header: "Phone",
    },

    {
      accessorKey: "targetCity",
      header: "Target City",
    },

    {
      accessorKey: "experience",
      header: "Experience",
    },

    {
      accessorKey: "status",
      header: "Status",
      kind: "status",
    },

    {
      accessorKey: "createdAt",
      header: "Submitted",
    },

  ],


  fields: [

    {
      name: "status",
      label: "Application Status",
      options:[
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
    },

  ],


  getRowLabel:
    (row)=>row.user.fullName,
};