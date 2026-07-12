import { type ZodObject, type ZodRawShape } from "zod"

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
