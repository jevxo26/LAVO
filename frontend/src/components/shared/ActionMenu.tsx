"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ActionMenuProps<TData> = {
  row: TData;
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
};

export function ActionMenu<TData>({ row, onEdit, onDelete }: ActionMenuProps<TData>) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button type="button" variant="ghost" size="icon-sm"
        className="h-7 w-7 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        onClick={() => onEdit(row)} aria-label="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm"
        className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        onClick={() => onDelete(row)} aria-label="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
