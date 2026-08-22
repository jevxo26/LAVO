import * as React from "react";
import { Plus, Pencil } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { RecordForm }                          from "./RecordForm";
import { type AdminRecord, type CrudModuleConfig } from "./types";

type RecordDialogProps<TRecord extends AdminRecord> = {
  mode: "create" | "update";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CrudModuleConfig<TRecord>;
  record?: TRecord;
  onSubmit: (values: TRecord) => void;
};

export function RecordDialog<TRecord extends AdminRecord>({
  mode, open, onOpenChange, config, record, onSubmit,
}: RecordDialogProps<TRecord>) {
  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          {/* Icon */}
          <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl
            ${isCreate ? "bg-indigo-50" : "bg-amber-50"}`}>
            {isCreate
              ? <Plus size={22} className="text-indigo-500" />
              : <Pencil size={20} className="text-amber-500" />}
          </div>
          <DialogTitle className="text-center text-base font-extrabold text-slate-900">
            {isCreate ? `New ${config.title}` : `Edit ${config.title}`}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            {isCreate
              ? `Fill in the details to create a new ${config.title.toLowerCase()} record.`
              : `Update the details for this ${config.title.toLowerCase()} record.`}
          </DialogDescription>
        </DialogHeader>

        <RecordForm
          config={config}
          defaultValues={record}
          submitLabel={isCreate ? `Create ${config.title}` : "Save Changes"}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
