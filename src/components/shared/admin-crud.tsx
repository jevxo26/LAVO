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
import {
  useForm,
  type DefaultValues,
  type Path,
  type Resolver,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { type ZodObject, type ZodRawShape } from "zod"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"

export type AdminRecord = {
  id: string
  status?: string
}

export type FormField<TRecord extends AdminRecord> = {
  name: keyof TRecord & string
  label: string
  type?: "text" | "email" | "tel" | "number"
  placeholder?: string
  options?: string[]
}

export type CrudColumn<TRecord extends AdminRecord> = {
  accessorKey: keyof TRecord & string
  header: string
  kind?: "status" | "currency" | "percent" | "rating" | "id"
}

export type CrudModuleConfig<TRecord extends AdminRecord> = {
  title: string
  description: string
  createLabel: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
  endpoint?: string
  data?: TRecord[]
  columns: CrudColumn<TRecord>[]
  schema: ZodObject<ZodRawShape>
  fields: FormField<TRecord>[]
  getRowLabel: (row: TRecord) => string
}

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

      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={config.searchPlaceholder}
            />
            <p className="text-sm text-slate-500">
              {table.getFilteredRowModel().rows.length} records
            </p>
          </div>

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
            <Pagination table={table} />
          </div>
        </CardContent>
      </Card>

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

type RecordDialogProps<TRecord extends AdminRecord> = {
  mode: "create" | "update"
  open: boolean
  onOpenChange: (open: boolean) => void
  config: CrudModuleConfig<TRecord>
  record?: TRecord
  onSubmit: (values: TRecord) => void
}

function RecordDialog<TRecord extends AdminRecord>({
  mode,
  open,
  onOpenChange,
  config,
  record,
  onSubmit,
}: RecordDialogProps<TRecord>) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${mode === "create" ? "Create" : "Update"} ${config.title}`}
      description="Mock form data is kept in local component state."
    >
      <RecordForm
        config={config}
        defaultValues={record}
        submitLabel={mode === "create" ? "Create" : "Save changes"}
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
      />
    </Dialog>
  )
}

type RecordFormProps<TRecord extends AdminRecord> = {
  config: CrudModuleConfig<TRecord>
  defaultValues?: TRecord
  submitLabel: string
  onCancel: () => void
  onSubmit: (values: TRecord) => void
}

export function RecordForm<TRecord extends AdminRecord>({
  config,
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
}: RecordFormProps<TRecord>) {
  type FormValues = Record<string, string | number>

  const form = useForm<FormValues>({
    resolver: zodResolver(config.schema) as Resolver<FormValues>,
    defaultValues: defaultValues as DefaultValues<FormValues>,
  })

  const submit = form.handleSubmit((values) => {
    onSubmit(values as unknown as TRecord)
  })

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.map((field) => {
          const error = form.formState.errors[field.name]?.message
          const value = form.watch(field.name)

          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.options ? (
                <Select
                  value={typeof value === "string" ? value : ""}
                  onValueChange={(nextValue) =>
                    form.setValue(field.name as Path<FormValues>, nextValue ?? "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id={field.name} className="w-full">
                    <SelectValue placeholder={field.placeholder ?? field.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type ?? "text"}
                  step={field.type === "number" ? "0.01" : undefined}
                  placeholder={field.placeholder}
                  {...form.register(field.name, {
                    valueAsNumber: field.type === "number",
                  })}
                />
              )}
              {error ? (
                <p className="text-sm text-red-600">{String(error)}</p>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  )
}

function FormattedCell({
  value,
  kind,
}: {
  value: unknown
  kind?: CrudColumn<AdminRecord>["kind"]
}) {
  if (kind === "status" && typeof value === "string") {
    return <StatusBadge status={value} />
  }

  if (kind === "id" && typeof value === "string") {
    // If it's a UUID, take the first segment and uppercase it. 
    // Example: e5966081-489d -> E5966081
    const shortId = value.includes('-') ? value.split('-')[0].toUpperCase() : value;
    return <span className="font-mono text-slate-600">{shortId}</span>
  }

  if (kind === "currency" && typeof value === "number") {
    return <span>৳{value.toFixed(2)}</span>
  }

  if (kind === "percent" && typeof value === "number") {
    return <span>{value}%</span>
  }

  if (kind === "rating" && typeof value === "number") {
    return (
      <span className={cn(value >= 4.5 ? "text-emerald-700" : "text-slate-700")}>
        {value.toFixed(1)}
      </span>
    )
  }

  return <span>{String(value ?? "-")}</span>
}
