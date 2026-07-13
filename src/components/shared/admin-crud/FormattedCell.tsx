import * as React from "react"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { cn } from "@/lib/utils"
import { type AdminRecord, type CrudColumn } from "./types"

export function FormattedCell({
  value,
  kind,
}: {
  value: unknown
  kind?: CrudColumn<AdminRecord>["kind"]
}) {
  if (kind === "status" && typeof value === "string") {
    return <StatusBadge status={value} />
  }

  if (kind === "id" && typeof value === "string") {
    // If it's a UUID, take the first segment and uppercase it. 
    // Example: e5966081-489d -> E5966081
    const shortId = value.includes('-') ? value.split('-')[0].toUpperCase() : value;
    return <span className="font-mono text-slate-600">{shortId}</span>
  }

  if (kind === "currency" && typeof value === "number") {
    return <span>৳{value.toFixed(2)}</span>
  }

  if (kind === "percent" && typeof value === "number") {
    return <span>{value}%</span>
  }

  if (kind === "rating" && typeof value === "number") {
    return (
      <span className={cn(value >= 4.5 ? "text-emerald-700" : "text-slate-700")}>
        {value.toFixed(1)}
      </span>
    )
  }

  return <span>{String(value ?? "-")}</span>
}
