"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AcceptDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isConfirmed?: boolean;
};

export function AcceptDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  loading = false,
  isConfirmed = false,
}: AcceptDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onCancel()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
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

          <Button
            onClick={onConfirm}
            disabled={loading || isConfirmed}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isConfirmed ? (
              "Confirmed"
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}