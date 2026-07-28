"use client";

import { SearchInput } from "@/components/shared/SearchInput";

type VerificationToolbarProps = {
  search: string;
  setSearch: (value: string) => void;
};

const VerificationToolbar = ({
  search,
  setSearch
}: VerificationToolbarProps) => {

  return (
    <div className="rounded-xl border bg-white p-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by Order ID or Customer..."
      />
    </div>
  )
}

export default VerificationToolbar;