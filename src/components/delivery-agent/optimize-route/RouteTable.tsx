"use client";

import { DataTable } from "@/components/shared/DataTable";
import { getRouteColumns } from "./RouteColumns";
import { OptimizedRoute } from "../types";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loading from "../Loading";

type RouteTableProps = {
  search: string;
  routes: OptimizedRoute[];
}
const RouteTable = ({ search, routes, }: RouteTableProps) => {
  const columns = getRouteColumns();
  const [data, setData] = useState<OptimizedRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("laundrix_token");

      const res = await axios.get(
        "/api/delivery-agent/optimized-routes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("SUCCESS", res.data);

      setData(res.data.data);
    } catch (err) {
      console.error("ERROR", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("useEffect called");
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
      {loading ? (
        <Loading />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          emptyMessage="No route available."
        />
      )}
    </div>
  );
};


export default RouteTable;