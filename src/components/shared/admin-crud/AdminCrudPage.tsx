import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
} from "@tanstack/react-table"
import { ListFilter, Plus } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ActionMenu } from "@/components/shared/ActionMenu"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { Pagination } from "@/components/shared/Pagination"
import { SearchInput } from "@/components/shared/SearchInput"

import { type AdminRecord, type CrudModuleConfig } from "./types"
import { FormattedCell } from "./FormattedCell"
import { RecordDialog } from "./RecordDialog"

type AdminCrudPageProps<TRecord extends AdminRecord> = {
  config: CrudModuleConfig<TRecord>
}

export function AdminCrudPage<TRecord extends AdminRecord>({
  config,
}: AdminCrudPageProps<TRecord>) {
  const [records, setRecords] = React.useState<TRecord[]>(config.data || [])
  const [search, setSearch] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingRecord, setEditingRecord] = React.useState<TRecord | null>(null)
  const [deletingRecord, setDeletingRecord] = React.useState<TRecord | null>(null)

  const fetchData = React.useCallback(async () => {
    if (!config.endpoint) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null
      const res = await axios.get(config.endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { search }
      })
      if (res.data?.success) {
        setRecords(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch data", err)
      toast.error("Failed to load records from server.")
    } finally {
      setIsLoading(false)
    }
  }, [config.endpoint, search])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns = React.useMemo<ColumnDef<TRecord>[]>(
    () => [
      ...config.columns.map((column) => ({
        accessorKey: column.accessorKey,
        header: column.header,
        cell: ({ row }: CellContext<TRecord, unknown>) => (
          <FormattedCell
            value={row.original[column.accessorKey]}
            kind={column.kind}
          />
        ),
      })),
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <ActionMenu
            row={row.original}
            onEdit={setEditingRecord}
            onDelete={setDeletingRecord}
          />
        ),
      },
    ],
    [config.columns]
  )

  const table = useReactTable({
    data: records,
    columns,
    state: {
      globalFilter: search,
    },
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const handleCreate = async (values: TRecord) => {
    if (!config.endpoint) {
      // Mock mode fallback
      const created = { ...values, id: values.id || `${Date.now()}` }
      setRecords((current) => [created, ...current])
      setCreateOpen(false)
      toast.success("Record created (Mock Mode)")
      return
    }
    
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null
      await axios.post(config.endpoint, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record created successfully")
      setCreateOpen(false)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create record")
    }
  }

  const handleUpdate = async (values: TRecord) => {
    if (!config.endpoint) {
      setRecords((current) => current.map((r) => (r.id === values.id ? values : r)))
      setEditingRecord(null)
      toast.success("Record updated (Mock Mode)")
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null
      await axios.patch(`${config.endpoint}/${values.id}`, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record updated successfully")
      setEditingRecord(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update record")
    }
  }

  const handleDelete = async () => {
    if (!deletingRecord) return
    
    if (!config.endpoint) {
      setRecords((current) => current.filter((r) => r.id !== deletingRecord.id))
      setDeletingRecord(null)
      toast.success("Record deleted (Mock Mode)")
      return
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("laundrix_token") : null
      await axios.delete(`${config.endpoint}/${deletingRecord.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record deleted successfully")
      setDeletingRecord(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete record")
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        actionLabel={config.createLabel}
        actionIcon={Plus}
        onAction={() => setCreateOpen(true)}
      />

      <div className="space-y-4">
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={config.searchPlaceholder}
              />
              <Button type="button" variant="outline">
                <ListFilter className="size-4" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent className="p-4">
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-44 text-center"
                        >
                          <div className="mx-auto max-w-sm">
                            <p className="font-medium text-slate-900">
                              {config.emptyTitle}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
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
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm ring-0">
          <CardContent className="">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {Math.max(table.getPageCount(), 1)}
              </p>
              <Pagination table={table} />
            </div>
          </CardContent>
        </Card>
      </div>
      <RecordDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        config={config}
        onSubmit={handleCreate}
      />
      {editingRecord ? (
        <RecordDialog
          mode="update"
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          config={config}
          record={editingRecord}
          onSubmit={handleUpdate}
        />
      ) : null}
      <ConfirmDialog
        open={!!deletingRecord}
        title="Delete record"
        description={
          deletingRecord
            ? `Delete ${config.getRowLabel(deletingRecord)}? This only updates local mock data.`
            : ""
        }
        onCancel={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
