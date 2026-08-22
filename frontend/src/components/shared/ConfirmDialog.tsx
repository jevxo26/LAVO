"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open, title, description, onCancel, onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          {/* Icon */}
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
            <AlertTriangle size={22} className="text-rose-500" />
          </div>
          <DialogTitle className="text-center text-base font-extrabold text-slate-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}
            className="flex-1 rounded-xl font-bold">
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}
            className="flex-1 rounded-xl font-bold gap-1.5">
            <Trash2 size={14} /> Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
