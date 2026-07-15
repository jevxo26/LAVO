"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { availableDeliveries } from "../../../../data/deliveryAgent/availableDeliveries";
import { AvailableDelivery } from "../../../../types/deliveryAgent/availableDelivery";
import { ViewDialog } from "@/components/shared/ViewDialog";
import { AcceptDialog } from "@/components/shared/AcceptDialog";
import { getDeliveryColumns } from "./DeliveryColumns";

type DeliveryTableProps = {
  search: string;
};

const DeliveryTable = ({ search }: DeliveryTableProps) => {
  const { user } = useAuth();
  const [viewOpen, setViewOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<AvailableDelivery | null>(null);

  const data = useMemo(() => {
    return availableDeliveries.filter((item) => {
      const matchAgent =
        item.agentId === user?.id ||
        item.agentId === undefined;
      const matchSearch =
        item.orderId
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        item.customerName
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchAgent && matchSearch;
    });
  }, [user, search]);

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
        data={data}
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
        onConfirm={() => {
          console.log("Started Delivery:", selectedDelivery);
          setStartOpen(false);
          setSelectedDelivery(null);
        }}
      />
    </div>
  );
};

export default DeliveryTable;