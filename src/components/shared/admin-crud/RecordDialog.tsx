import * as React from "react"
import { Dialog } from "@/components/ui/dialog"
import { RecordForm } from "./RecordForm"
import { type AdminRecord, type CrudModuleConfig } from "./types"

type RecordDialogProps<TRecord extends AdminRecord> = {
  mode: "create" | "update"
  open: boolean
  onOpenChange: (open: boolean) => void
  config: CrudModuleConfig<TRecord>
  record?: TRecord
  onSubmit: (values: TRecord) => void
}

export function RecordDialog<TRecord extends AdminRecord>({
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
