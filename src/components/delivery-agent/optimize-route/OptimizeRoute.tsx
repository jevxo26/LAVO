"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import RouteTable from "./RouteTable";
import RouteToolbar from "./RouteToolbar";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";

const RouteMap = dynamic(
  () => import("./RouteMap"),
  { ssr: false }
);

const OptimizeRoute = () => {
  const [search, setSearch] = useState("");
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem("laundrix_token");

        const res = await axios.get(
          "/api/delivery-agent/optimized-routes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRoutes(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoutes();
  }, []);

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
          <RouteMap routes={routes}/>
        </div>
      </div>
      <RouteToolbar
        search={search}
        setSearch={setSearch}
      />
      <RouteTable
        search={search}
        routes={routes}
      />

    </div>
  );
};

export default OptimizeRoute;