import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  open: "bg-blue-50 text-blue-700 ring-blue-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
  hidden: "bg-slate-100 text-slate-600 ring-slate-200",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        statusStyles[status.toLowerCase()] ?? statusStyles.inactive
      )}
    >
      {status}
    </span>
  )
}
