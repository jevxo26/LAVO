"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { useAuth } from "@/hooks/useAuth";


import { getPickupColumns } from "./pickupColumns";
import { availablePickups } from "../../../../data/deliveryAgent/availablePickups";
import { AvailablePickup } from "../../../../types/deliveryAgent/availablePickup";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { AcceptDialog } from "@/components/shared/AcceptDialog";
import { ViewDialog } from "@/components/shared/ViewDialog";

type PickupTableProps = {
  search: string;
};

const PickupTable = ({ search }: PickupTableProps) => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedPickup, setSelectedPickup] =
    useState<AvailablePickup | null>(null);

    // Future backend ready
    const data = useMemo(() => {
        return availablePickups.filter((item) => {
            const matchAgent =
            item.agentId === user?.id || item.agentId === undefined;

            const matchSearch =
            item.orderId.toString().includes(search) ||
            item.customerName
                .toLowerCase()
                .includes(search.toLowerCase());

            return matchAgent && matchSearch;
        });
    }, [user, search]);
    
    const handleView = (pickup: AvailablePickup) => {
        setSelectedPickup(pickup);
        setViewOpen(true);
    };

        const handleAccept = (pickup: AvailablePickup) => {
        setSelectedPickup(pickup);
        setOpen(true);
        };
        const columns = getPickupColumns({
            onView: handleView,
            onAccept: handleAccept,
        });

    return (
        <div className="rounded-xl border bg-white p-5 space-y-5">
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No pickup available."
        />
        {/* View dialog */}
        <ViewDialog
        open={viewOpen}
        title="Pickup Details"
        onClose={() => {
            setViewOpen(false);
            setSelectedPickup(null);
        }}
        >
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
            <p className="text-slate-500">Order ID</p>
            <p className="font-medium">#{selectedPickup?.orderId}</p>
            </div>

            <div>
            <p className="text-slate-500">Customer</p>
            <p>{selectedPickup?.customerName}</p>
            </div>

            <div>
            <p className="text-slate-500">Phone</p>
            <p>{selectedPickup?.customerPhone}</p>
            </div>

            <div>
            <p className="text-slate-500">Branch</p>
            <p>{selectedPickup?.branch}</p>
            </div>

            <div className="col-span-2">
            <p className="text-slate-500">Address</p>
            <p>{selectedPickup?.pickupAddress}</p>
            </div>

            <div>
            <p className="text-slate-500">Distance</p>
            <p>{selectedPickup?.distance}</p>
            </div>

            <div>
            <p className="text-slate-500">Priority</p>
            <p>{selectedPickup?.priority}</p>
            </div>
        </div>
        </ViewDialog>
        {/* Accep dialog */}
        <AcceptDialog
            open={open}
            title="Accept Pickup"
            description={`Are you sure you want to accept Order #${selectedPickup?.orderId}?`}
            onCancel={() => {
                setOpen(false);
                setSelectedPickup(null);
            }}
            onConfirm={() => {
                console.log("Accepted:", selectedPickup);
                setOpen(false);
                setSelectedPickup(null);
            }}
        />

        {/* Pagination next step */}
        </div>
    );
};

export default PickupTable;