import { ColumnDef } from "@tanstack/react-table";
import { Eye, Check, Package, Store, Building2 } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { AvailablePickup } from "../types";

type PickupColumnsProps = {
  onView: (pickup: AvailablePickup) => void;
  onAccept: (pickup: AvailablePickup) => void;
};

export const getPickupColumns = ({
  onView,
  onAccept,
}: PickupColumnsProps): ColumnDef<AvailablePickup>[] => [
  {
    accessorKey: "orderId",
    header: "Order ID",
    cell: ({ row }) => (
      <span className="font-medium text-slate-700">
        #{row.original.orderId}
      </span>
    ),
  },

  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-slate-800">
          {row.original.customerName}
        </p>
        <p className="text-xs text-slate-500">
          {row.original.customerPhone}
        </p>
      </div>
    ),
  },

  {
    accessorKey: "totalGarments",
    header: "Garment Count",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs">
        <Package className="h-3.5 w-3.5 text-slate-500" />
        {row.original.totalGarments ?? 1} pcs
      </span>
    ),
  },

  {
    accessorKey: "dropoffDestination",
    header: "Drop-off Hub / Destination",
    cell: ({ row }) => {
      const dest = row.original.dropoffDestination;
      if (dest?.isVendor) {
        return (
          <div className="inline-flex flex-col">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              <Store className="h-3.5 w-3.5 text-purple-600" />
              Vendor: {dest.name}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 font-mono">Code: {dest.code}</span>
          </div>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          Main Hub: {dest?.name || row.original.branch}
        </span>
      );
    },
  },

  {
    accessorKey: "pickupAddress",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate">
        {row.original.pickupAddress}
      </div>
    ),
  },

  {
    accessorKey: "distance",
    header: "Distance",
    cell: ({ row }) => (
      <span className="font-medium text-violet-600">
        {row.original.distance}
      </span>
    ),
  },

  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority;

      return (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            priority === "High"
              ? "bg-red-100 text-red-700"
              : priority === "Medium"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {priority}
        </span>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const isAccepted = row.original.status === "IN_PROGRESS" || row.original.status === "ACCEPTED";
      return (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onView(row.original)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {!isAccepted && (
            <Button
              size="icon"
              onClick={() => onAccept(row.original)}
              title="Accept Pickup"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];