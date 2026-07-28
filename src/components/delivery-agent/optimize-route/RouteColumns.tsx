import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OptimizedRoute } from "../types";
import { Navigation } from "lucide-react";

export const getRouteColumns = (): ColumnDef<OptimizedRoute>[] => [
  {
    accessorKey: "routeName",
    header: "Route",
    cell: ({ row }) => (
      <span className="font-semibold text-slate-700">{row.original.routeName}</span>
    ),
  },
  {
    accessorKey: "endLocation",
    header: "Destination",
    cell: ({ row }) => (
      <span className="text-slate-600 text-xs">{row.original.endLocation}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const isPickup = row.original.type === "PICKUP";
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${
            isPickup ? "bg-blue-500" : "bg-emerald-500"
          }`}
        >
          {isPickup ? "Pickup" : "Drop-off"}
        </span>
      );
    },
  },
  {
    accessorKey: "totalDistance",
    header: "Distance",
  },
  {
    accessorKey: "estimatedTime",
    header: "Est. Time",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "navigate",
    header: "Navigate",
    cell: ({ row }) => {
      const { latitude, longitude, endLocation } = row.original;

      if (!latitude || !longitude) {
        return (
          <span className="text-xs text-slate-400 italic">No GPS</span>
        );
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

      return (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Navigate to: ${endLocation}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          <Navigation size={12} />
          Navigate
        </a>
      );
    },
  },
];