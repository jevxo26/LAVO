"use client"

import { Edit2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

type ActionMenuProps<TData> = {
  row: TData
  onEdit: (row: TData) => void
  onDelete: (row: TData) => void
}

export function ActionMenu<TData>({
  row,
  onEdit,
  onDelete,
}: ActionMenuProps<TData>) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(row)}
        aria-label="Edit record"
      >
        <Edit2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(row)}
        aria-label="Delete record"
      >
        <Trash2 className="size-4 text-red-600" />
      </Button>
    </div>
  )
}
