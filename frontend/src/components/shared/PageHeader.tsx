import { type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type PageHeaderProps = {
  title: string
  description: string
  actionLabel?: string
  actionIcon?: LucideIcon
  onAction?: () => void
}

export function PageHeader({
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="w-full sm:w-auto">
          {ActionIcon ? <ActionIcon className="size-4" /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
