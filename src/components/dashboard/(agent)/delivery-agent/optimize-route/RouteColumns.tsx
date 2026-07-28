import { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { OptimizedRoute } from "../types";


export const getRouteColumns = (): ColumnDef<OptimizedRoute>[] => [
    {
        accessorKey: "routeName",
        header: "Route",
    },
    {
        accessorKey: "startLocation",
        header: "Start Point",
    },
    {
        accessorKey: "endLocation",
        header: "End Point",
    },
    {
        accessorKey: "totalStops",
        header: "Stops",
    },
    {
        accessorKey: "totalDistance",
        header: "Distance",
    },
    {
        accessorKey: "estimatedTime",
        header: "Estimated Time",
    },
    {
        accessorKey: "pickups",
        header: "Pickups",
    },
    {
        accessorKey: "deliveries",
        header: "Deliveries",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <StatusBadge
                status={row.original.status}
            />
        )
    }

];