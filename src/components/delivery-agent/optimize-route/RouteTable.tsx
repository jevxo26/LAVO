"use client";

import { DataTable } from "@/components/shared/DataTable";
import { optimizedRoutes } from "../../../../data/deliveryAgent/optimizedRoutes";
import { getRouteColumns } from "./RouteColumns";

type RouteTableProps = {
 search:string;
}
const RouteTable = ({search}:RouteTableProps)=>{
  const columns = getRouteColumns();

  const data = optimizedRoutes.filter((item) => {
    const searchText = search.toLowerCase();
        return (
        item.routeName.toLowerCase().includes(searchText) ||
        item.startLocation.toLowerCase().includes(searchText) ||
        item.endLocation.toLowerCase().includes(searchText) ||
        item.agentName.toLowerCase().includes(searchText)
        );
    });

  return (
    <div className="rounded-xl border bg-white p-5">
      <DataTable
        columns={columns}
        data={data}
        emptyMessage="No route available."
      />
    </div>
  );
};


export default RouteTable;