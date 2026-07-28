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
const RouteTable = ({ search, routes }: RouteTableProps) => {
  const columns = getRouteColumns();

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase();

    return routes.filter(
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
  }, [routes, search]);

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