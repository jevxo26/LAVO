"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

type PaginationProps<TData> = {
  table: Table<TData>;
};

export function Pagination<TData>({ table }: PaginationProps<TData>) {
  const current  = table.getState().pagination.pageIndex + 1;
  const total    = Math.max(table.getPageCount(), 1);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm"
        className="h-8 rounded-xl text-xs font-bold gap-1"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}>
        <ChevronLeft className="h-3.5 w-3.5" /> Previous
      </Button>

      <span className="rounded-lg border border-slate-200 bg-muted/40 px-3 py-1 text-xs font-bold text-slate-700">
        {current} / {total}
      </span>

      <Button variant="outline" size="sm"
        className="h-8 rounded-xl text-xs font-bold gap-1"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}>
        Next <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
