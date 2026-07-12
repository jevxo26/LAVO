import * as React from "react"
import { useForm, type DefaultValues, type Path, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type AdminRecord, type CrudModuleConfig } from "./types"

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
