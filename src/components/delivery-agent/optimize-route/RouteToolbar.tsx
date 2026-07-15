"use client";

import { SearchInput } from "@/components/shared/SearchInput";

type RouteToolbarProps = {
  search:string;
  setSearch:(value:string)=>void;
}
const RouteToolbar = ({
  search,
  setSearch
}:RouteToolbarProps)=>{

return (
        <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by route name or location..."
            />
        </div>
    )
}

export default RouteToolbar;