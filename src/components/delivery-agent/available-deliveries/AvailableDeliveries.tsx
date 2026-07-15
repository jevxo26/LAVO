"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import DeliveryToolbar from "./DeliveryToolbar";
import DeliveryTable from "./DeliveryTable";

const AvailableDeliveries = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Deliveries"
        description="View and manage all assigned delivery requests."
      />

      <DeliveryToolbar
        search={search}
        setSearch={setSearch}
      />

      <DeliveryTable
        search={search}
      />
    </div>
  );
};

export default AvailableDeliveries;