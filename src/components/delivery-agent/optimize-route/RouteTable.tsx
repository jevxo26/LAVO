"use client";

import { DataTable } from "@/components/shared/DataTable";
import { getRouteColumns } from "./RouteColumns";
import { OptimizedRoute } from "../types";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type RouteTableProps = {
  search: string;
}
const RouteTable = ({ search }: RouteTableProps) => {
  const columns = getRouteColumns();
  const [data, setData] = useState<OptimizedRoute[]>([]);

  const fetchRoutes = async () => {
    const token = localStorage.getItem("laundrix_token");

    const res = await axios.get(
      "/api/delivery-agent/optimized-routes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setData(res.data.data);
  };
  useEffect(() => {
    fetchRoutes();
  }, []);

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase();

    return data.filter(
      (item) =>
        item.routeName
          .toLowerCase()
          .includes(searchText) ||
        item.startLocation
          .toLowerCase()
          .includes(searchText) ||
        item.endLocation
          .toLowerCase()
          .includes(searchText)
    );
  }, [data, search]);

  return (
    <div className="rounded-xl border bg-white p-5">
      <DataTable
        columns={columns}
        data={filteredData}
        emptyMessage="No route available."
      />
    </div>
  );
};


export default RouteTable;