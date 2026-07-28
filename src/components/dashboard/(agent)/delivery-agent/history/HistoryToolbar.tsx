"use client";

import { SearchInput } from "@/components/shared/SearchInput";

type HistoryToolbarProps = {
  search: string;
  setSearch: (value:string)=>void;
};

const HistoryToolbar = ({
  search,
  setSearch
}:HistoryToolbarProps)=>{

  return (
    <div className="rounded-xl border bg-white p-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by Order ID or Customer..."
      />
    </div>
  );
};


export default HistoryToolbar;