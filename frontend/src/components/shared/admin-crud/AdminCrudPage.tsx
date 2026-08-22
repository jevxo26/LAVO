"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import { Plus, Inbox } from "lucide-react";

import { Button }          from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader }      from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { SearchInput }     from "@/components/shared/SearchInput";
import { Pagination }      from "@/components/shared/Pagination";
import { ConfirmDialog }   from "@/components/shared/ConfirmDialog";
import { RecordDialog }    from "./RecordDialog";
import { useCrudData }     from "./useCrudData";
import { useCrudTable }    from "./useCrudTable";
import { type AdminRecord, type CrudModuleConfig } from "./types";

type Props<TRecord extends AdminRecord> = {
  config: CrudModuleConfig<TRecord>;
  hideHeader?: boolean;
};

export function AdminCrudPage<TRecord extends AdminRecord>({
  config, hideHeader = false,
}: Props<TRecord>) {
  const [search,         setSearch]         = React.useState("");
  const [createOpen,     setCreateOpen]     = React.useState(false);
  const [editingRecord,  setEditingRecord]  = React.useState<TRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = React.useState<TRecord | null>(null);

  const { records, isLoading, isReadOnly, handleCreate, handleUpdate, handleDelete } =
    useCrudData(config, search);

  const { table, columns } = useCrudTable<TRecord>(
    records,
    config,
    search,
    setSearch,
    isReadOnly,
    (row: TRecord) => setEditingRecord(row),
    (row: TRecord) => setDeletingRecord(row)
  );

  return (
    <div className="space-y-3">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      {!hideHeader && (
        <PageHeader
          title={config.title}
          description={config.description}
          actionLabel={!isReadOnly ? config.createLabel : undefined}
          actionIcon={Plus}
          onAction={() => setCreateOpen(true)}
        />
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={config.searchPlaceholder}
          />
          {hideHeader && !isReadOnly && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-9 rounded-xl text-xs font-bold gap-1.5 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              {config.createLabel}
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow
                  key={hg.id}
                  className="bg-muted/50 hover:bg-muted/50 border-b border-border"
                >
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground py-3"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/40 transition-colors duration-150 border-b border-border last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3.5 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-56 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                        <Inbox className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-black text-card-foreground">
                        {config.emptyTitle}
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                        {config.emptyDescription}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card px-5 py-3.5 shadow-sm">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-black text-card-foreground">
            {table.getRowModel().rows.length}
          </span>{" "}
          of{" "}
          <span className="font-black text-card-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          records
        </p>
        <Pagination table={table} />
      </div>

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}
      <RecordDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        config={config}
        onSubmit={(v) => handleCreate(v, () => setCreateOpen(false))}
      />

      {editingRecord && (
        <RecordDialog
          mode="update"
          open
          onOpenChange={(o) => !o && setEditingRecord(null)}
          config={config}
          record={editingRecord}
          onSubmit={(v) => handleUpdate(v, () => setEditingRecord(null))}
        />
      )}

      <ConfirmDialog
        open={!!deletingRecord}
        title="Delete record"
        description={
          deletingRecord
            ? `Delete "${config.getRowLabel(deletingRecord)}"? This action cannot be undone.`
            : ""
        }
        onCancel={() => setDeletingRecord(null)}
        onConfirm={() =>
          deletingRecord && handleDelete(deletingRecord, () => setDeletingRecord(null))
        }
      />
    </div>
  );
}
