"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { ViewDialog } from "@/components/shared/ViewDialog";
import { AcceptDialog } from "@/components/shared/AcceptDialog";
import { getDeliveryColumns } from "./DeliveryColumns";
import { AvailableDelivery } from "../types";

type DeliveryTableProps = {
  search: string;
};

const DeliveryTable = ({ search }: DeliveryTableProps) => {
  const { user } = useAuth();
  const [data, setData] = useState<AvailableDelivery[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<AvailableDelivery | null>(null);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem("laundrix_token");

      const res = await axios.get(
        "/api/delivery-agent/available-deliveries",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Available Deliveries:", res.data);

      setData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        item.orderId
          .toString()
          .includes(search) ||
        item.customerName
          ?.toLowerCase()
          .includes(search.toLowerCase());

      return matchSearch;
    });
  }, [data, search]);
  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleView = (delivery: AvailableDelivery) => {
    setSelectedDelivery(delivery);
    setViewOpen(true);
  };
  const handleStart = (delivery: AvailableDelivery) => {

    setSelectedDelivery(delivery);
    setStartOpen(true);

  };

  const columns = getDeliveryColumns({
    onView: handleView,
    onStart: handleStart,

  });

  return (
    <div className="rounded-xl border bg-white p-5 space-y-5">
      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage="No delivery available."
      />
      {/* View Dialog */}
      <ViewDialog
        open={viewOpen}
        title="Delivery Details"
        onClose={() => {
          setViewOpen(false);
          setSelectedDelivery(null);
        }}
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">
              Order ID
            </p>
            <p className="font-medium">
              #{selectedDelivery?.orderId}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Customer
            </p>
            <p>
              {selectedDelivery?.customerName}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Phone
            </p>
            <p>
              {selectedDelivery?.customerPhone}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Branch
            </p>
            <p>
              {selectedDelivery?.branch}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-slate-500">
              Address
            </p>
            <p>
              {selectedDelivery?.deliveryAddress}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Parcel
            </p>
            <p>
              {selectedDelivery?.parcelType}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Weight
            </p>
            <p>
              {selectedDelivery?.weight}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              Payment
            </p>
            <p>
              {selectedDelivery?.paymentType}
            </p>
          </div>
          <div>
            <p className="text-slate-500">
              COD Amount
            </p>
            <p>
              ৳{selectedDelivery?.codAmount}
            </p>
          </div>
        </div>
      </ViewDialog>
      {/* Start Delivery Confirmation */}
      <AcceptDialog
        open={startOpen}
        title="Start Delivery"
        description={`Are you sure you want to start Order #${selectedDelivery?.orderId}?`}
        onCancel={() => {
          setStartOpen(false);
          setSelectedDelivery(null);
        }}
        onConfirm={async () => {
          try {
            const token = localStorage.getItem("laundrix_token");

            await axios.patch(
              `/api/delivery-agent/accept-delivery/${selectedDelivery?.id}`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setStartOpen(false);
            setSelectedDelivery(null);

            fetchDeliveries();
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
};

export default DeliveryTable;