import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { History } from "../types";


export const historyColumns: ColumnDef<History>[] = [
    {
        accessorKey: "orderId",
        header: "Order ID",
        cell: ({ row }) => (
            <span className="font-medium">
                #{row.original.orderId}
            </span>
        )
    },
    {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
            <div>
                <p className="font-medium">
                    {row.original.customerName}
                </p>
                <p className="text-xs text-slate-500">
                    {row.original.customerPhone}
                </p>
            </div>
        )
    },
    {
        accessorKey: "serviceType",
        header: "Type",
    },
    {
        accessorKey: "branch",
        header: "Branch",
    },
    // {
    //     accessorKey: "parcelType",
    //     header: "Parcel",
    // },
    {
        accessorKey: "paymentStatus",
        header: "Payment",
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
            <span>
                ৳{row.original.amount}
            </span>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <StatusBadge status={row.original.status} />
        )
    },
    {
        accessorKey: "completedAt",
        header: "Completed At",
        cell: ({ row }) => (
            <span>
                {row.original.completedAt
                    ? new Date(row.original.completedAt).toLocaleDateString()
                    : "N/A"
                }
            </span>
        )
    }
];