"use client"

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
import axios, { AxiosError } from "axios"

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
import { useAppSelector } from "@/store/store"

type AdminCrudPageProps<TRecord extends AdminRecord> = {
  config: CrudModuleConfig<TRecord>
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback
  }

  return fallback
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

  // Read the token from Redux store (stays in sync with auth lifecycle)
  const token = useAppSelector((s) => s.auth.token)
  const isAuthLoading = useAppSelector((s) => s.auth.isLoading)

  const fetchData = React.useCallback(async () => {
    if (!config.endpoint) {
      setIsLoading(false)
      return
    }
    try {
      setIsLoading(true)
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
  }, [config.endpoint, search, token])

  React.useEffect(() => {
    // Wait for auth rehydration to complete before fetching — prevents
    // a race where fetchMeThunk hasn't resolved yet and token is still null
    if (isAuthLoading) return
    fetchData()
  }, [fetchData, isAuthLoading])

  const user = useAppSelector((s) => s.auth.user)
  const isSuperAdmin = user && (user.userType?.toUpperCase() === "SUPER_ADMIN" || (user as any).role?.toUpperCase() === "SUPER_ADMIN")
  const isNormalAdmin = user && (user.userType?.toUpperCase() === "ADMIN" || (user as any).role?.toUpperCase() === "ADMIN")
  const isUserManagementModule = config.endpoint?.includes("users") || config.title?.toLowerCase().includes("user")
  const isReadOnlyView = isNormalAdmin && !isSuperAdmin && isUserManagementModule

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
      ...(!isReadOnlyView
        ? [
            {
              id: "actions",
              header: () => <span className="sr-only">Actions</span>,
              cell: ({ row }: CellContext<TRecord, unknown>) => (
                <ActionMenu
                  row={row.original}
                  onEdit={setEditingRecord}
                  onDelete={setDeletingRecord}
                />
              ),
            },
          ]
        : []),
    ],
    [config.columns, isReadOnlyView]
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
      // TODO: Remove Mock mode fallback once CRUD API endpoints are fully implemented
      const created = { ...values, id: values.id || `${Date.now()}` }
      setRecords((current) => [created, ...current])
      setCreateOpen(false)
      toast.success("Record created (Mock Mode)")
      return
    }
    
    try {
      await axios.post(config.endpoint, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record created successfully")
      setCreateOpen(false)
      fetchData()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create record"))
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
      await axios.patch(`${config.endpoint}/${values.id}`, values, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record updated successfully")
      setEditingRecord(null)
      fetchData()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update record"))
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
      await axios.delete(`${config.endpoint}/${deletingRecord.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      toast.success("Record deleted successfully")
      setDeletingRecord(null)
      fetchData()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete record"))
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={config.title}
        description={config.description}
        actionLabel={!isReadOnlyView ? config.createLabel : undefined}
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
