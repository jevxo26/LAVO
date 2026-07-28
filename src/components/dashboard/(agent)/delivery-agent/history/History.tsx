"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import HistoryToolbar from "./HistoryToolbar";
import HistoryTable from "./HistoryTable";

const History = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery History"
        description="View all completed pickups and deliveries."
      />
      <HistoryToolbar
        search={search}
        setSearch={setSearch}
      />
      <HistoryTable
        search={search}
      />
    </div>
  );
};

export default History;