import { ColumnDef } from "@tanstack/react-table";
import { Eye, Truck } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { AvailableDelivery } from "../types";


type DeliveryColumnsProps = {
  onView: (delivery: AvailableDelivery) => void;
  onStart: (delivery: AvailableDelivery) => void;
};


export const getDeliveryColumns = ({
  onView,
  onStart,
}: DeliveryColumnsProps): ColumnDef<AvailableDelivery>[] => [
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
    accessorKey: "branch",
    header: "Branch",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.branch}
      </span>
    ),
  },
  {
    accessorKey: "deliveryAddress",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate">
        {row.original.deliveryAddress}
      </div>
    ),
  },
  {
    accessorKey: "parcelType",
    header: "Parcel",
  },
  {
    accessorKey: "paymentType",
    header: "Payment",
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={() => onStart(row.original)}
        >
          <Truck className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];