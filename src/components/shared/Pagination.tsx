"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { type Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

type PaginationProps<TData> = {
  table: Table<TData>
}

export function Pagination<TData>({ table }: PaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {Math.max(table.getPageCount(), 1)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
