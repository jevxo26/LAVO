"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import PickupToolbar from "./PickupToolbar";
import PickupTable from "./PickupTable";

const AvailablePickups = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Pickups"
        description="View and manage all assigned pickup requests."
      />

      <PickupToolbar
        search={search}
        setSearch={setSearch}
      />

      <PickupTable
        search={search}
      />
    </div>
  );
};

export default AvailablePickups;