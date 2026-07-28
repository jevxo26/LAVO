"use client";

import { SearchInput } from "@/components/shared/SearchInput";

type DeliveryToolbarProps = {
  search: string;
  setSearch: (value: string) => void;
};

const DeliveryToolbar = ({
  search,
  setSearch,
}: DeliveryToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by Order ID or Customer..."
      />
    </div>
  );
};

export default DeliveryToolbar;