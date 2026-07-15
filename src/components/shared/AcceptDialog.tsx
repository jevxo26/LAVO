"use client";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

type AcceptDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AcceptDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: AcceptDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onCancel()}
      title={title}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="size-4" />
        </div>

        <p className="text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={onConfirm}>
          Accept
        </Button>
      </div>
    </Dialog>
  );
}