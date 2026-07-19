"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { useAuth } from "@/hooks/useAuth";


import { getPickupColumns } from "./pickupColumns";
import { AcceptDialog } from "@/components/shared/AcceptDialog";
import { ViewDialog } from "@/components/shared/ViewDialog";
import { AvailablePickup } from "../types";
import axios from "axios";
import { toast } from "@/lib/toast";
import Loading from "../Loading";

type PickupTableProps = {
    search: string;
};

const PickupTable = ({ search }: PickupTableProps) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AvailablePickup[]>([]);
    const [open, setOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedPickup, setSelectedPickup] =
        useState<AvailablePickup | null>(null);

    // Future backend ready
    const fetchPickups = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem(
                "laundrix_token"
            );
            const res = await axios.get(
                "/api/delivery-agent/available-pickups",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // console.log(
            //     "Available Pickup:",
            //     res.data
            // );
            setData(res.data.data);
        } catch (error) {
            console.log(
                "Pickup fetch error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPickups();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchSearch =
                item.orderId
                    .toString()
                    .includes(search)
                ||
                item.customerName
                    ?.toLowerCase()
                    .includes(search.toLowerCase());
            return matchSearch;
        });
    }, [data, search]);

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
            {loading ? (
                <Loading/>
            ) : (
                <DataTable
                    columns={columns}
                    data={filteredData}
                    emptyMessage="No pickup available."
                />)}
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
                onConfirm={async () => {
                    if (!selectedPickup) return;
                    try {
                        const token = localStorage.getItem("laundrix_token");

                        await axios.patch(
                            `/api/delivery-agent/accept-pickup/${selectedPickup?.id}`,
                            {},
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        // list reload
                        await fetchPickups();

                        setOpen(false);
                        setSelectedPickup(null);

                        toast.success("Pickup accepted successfully");
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to accept pickup");
                    }
                }}
            />

            {/* Pagination next step */}
        </div>
    );
};

export default PickupTable;