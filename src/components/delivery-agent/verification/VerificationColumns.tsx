import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { VerificationType } from "../types";

type VerificationColumnsProps = {
  onVerify:(item:VerificationType)=>void;
}

export const getVerificationColumns = ({
 onVerify
}:VerificationColumnsProps):ColumnDef<VerificationType>[] => [
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
        accessorKey: "deliveryAddress",
        header: "Address",
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate">
                {row.original.deliveryAddress}
            </div>
        )
    },
    {
        accessorKey: "deliveryStatus",
        header: "Delivery Status",
        cell: ({ row }) => (
            <StatusBadge
                status={row.original.deliveryStatus}
            />
        )
    },
    {
        accessorKey: "verificationStatus",
        header: "OTP Status",
        cell: ({ row }) => (
            <StatusBadge
                status={row.original.verificationStatus}
            />
        )
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
            <Button
                size="sm"
                onClick={()=>onVerify(row.original)}
            >
                Verify OTP
            </Button>
        )
    }
];