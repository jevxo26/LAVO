"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/shared/DataTable";
import { Pagination } from "@/components/shared/Pagination";
import { useAuth } from "@/hooks/useAuth";


import { getPickupColumns } from "./pickupColumns";
import { AcceptDialog } from "@/components/shared/AcceptDialog";
import { ViewDialog } from "@/components/shared/ViewDialog";
import { AvailablePickup } from "../types";
import QRCode from "react-qr-code";
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

    const [printOpen, setPrintOpen] = useState(false);
    const [qrData, setQrData] = useState<any[]>([]);

    const handleView = (pickup: AvailablePickup) => {
        setSelectedPickup(pickup);
        setViewOpen(true);
    };

    const handleAccept = (pickup: AvailablePickup) => {
        setSelectedPickup(pickup);
        setOpen(true);
    };

    const handlePrintQR = async (pickup: AvailablePickup) => {
        try {
            const token = localStorage.getItem("laundrix_token");
            const res = await axios.get(
                `/api/delivery-agent/pickup-qrcodes/${pickup.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setQrData(res.data.data);
            setPrintOpen(true);
        } catch (error) {
            console.error("Failed to fetch QR codes", error);
            toast.error("Failed to fetch QR codes for this order");
        }
    };

    const columns = getPickupColumns({
        onView: handleView,
        onAccept: handleAccept,
        onPrintQR: handlePrintQR,
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

            <ViewDialog
                open={printOpen}
                title="Print QR Labels"
                onClose={() => setPrintOpen(false)}
            >
                <div className="space-y-6">
                    <div className="flex justify-between items-center print:hidden">
                        <p className="text-sm text-slate-500">Scan these labels for each garment item when collecting.</p>
                        <button 
                            onClick={() => window.print()} 
                            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Print Labels
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6" id="printable-qr-section">
                        {qrData.map((qrItem, idx) => (
                            <div key={idx} className="border border-dashed border-gray-300 p-4 flex flex-col items-center justify-center space-y-3 rounded-lg">
                                <p className="font-medium text-center text-sm">{qrItem.garmentName}</p>
                                {qrItem.qrCode ? (
                                    <QRCode value={qrItem.qrCode} size={100} />
                                ) : (
                                    <div className="h-[100px] w-[100px] bg-gray-100 flex items-center justify-center text-xs text-gray-500">No QR</div>
                                )}
                                <p className="text-xs text-gray-500 text-center font-mono">{qrItem.qrCode}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </ViewDialog>

            {/* Pagination next step */}
        </div>
    );
};

export default PickupTable;