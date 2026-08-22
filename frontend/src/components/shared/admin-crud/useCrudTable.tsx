"use client";

import * as React from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";
import { FormattedCell } from "./FormattedCell";
import { ActionMenu } from "@/components/shared/ActionMenu";
import { type AdminRecord, type CrudModuleConfig } from "./types";

export function useCrudTable<TRecord extends AdminRecord>(
  records: TRecord[],
  config: CrudModuleConfig<TRecord>,
  search: string,
  onSearch: (v: string) => void,
  isReadOnly: boolean,
  onEdit: (row: TRecord) => void,
  onDelete: (row: TRecord) => void
): {
  table: Table<TRecord>;
  columns: ColumnDef<TRecord>[];
} {
  const columns = React.useMemo<ColumnDef<TRecord>[]>(() => {
    const cols: ColumnDef<TRecord>[] = config.columns.map((col) => ({
      accessorKey: col.accessorKey as string,
      header: col.header,
      cell: ({ row }: CellContext<TRecord, unknown>) => (
        <FormattedCell value={(row.original as Record<string, any>)[col.accessorKey]} kind={col.kind} />
      ),
    }));

    if (!isReadOnly) {
      cols.push({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }: CellContext<TRecord, unknown>) => (
          <ActionMenu row={row.original} onEdit={onEdit} onDelete={onDelete} />
        ),
      });
    }

    return cols;
  }, [config.columns, isReadOnly, onEdit, onDelete]);

  const table = useReactTable({
    data: records,
    columns,
    state: { globalFilter: search },
    initialState: { pagination: { pageSize: 6 } },
    onGlobalFilterChange: onSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return { table, columns };
}
