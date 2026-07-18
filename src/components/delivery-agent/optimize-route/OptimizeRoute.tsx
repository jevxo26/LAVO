"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import RouteTable from "./RouteTable";
import RouteToolbar from "./RouteToolbar";
import { useState } from "react";
import dynamic from "next/dynamic";

const RouteMap = dynamic(
  () => import("./RouteMap"),
  { ssr: false }
);

const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-6">

      <PageHeader
        title="Optimized Route"
        description="System generated route plan to complete pickups and deliveries efficiently."
      />
      {/* Map Placeholder */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">
          Route Map
        </h2>
        {/* <div className="flex h-[300px] items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          Map will be integrated here
        </div> */}
        <div className="rounded-lg overflow-hidden">
          <RouteMap />
        </div>
      </div>
      <RouteToolbar
        search={search}
        setSearch={setSearch}
      />
      <RouteTable
        search={search}
      />

    </div>
  );
};

export default OptimizeRoute;