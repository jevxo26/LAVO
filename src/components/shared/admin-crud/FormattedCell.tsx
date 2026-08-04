import * as React from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { type AdminRecord, type CrudColumn } from "./types";

export function FormattedCell({
  value,
  kind,
}: {
  value: unknown;
  kind?: CrudColumn<AdminRecord>["kind"];
}) {
  // ── Status badge ─────────────────────────────────────────────────────────
  if (kind === "status" && typeof value === "string") {
    return <StatusBadge status={value} />;
  }

  // ── Short ID (UUID first segment) ─────────────────────────────────────────
  if (kind === "id" && typeof value === "string") {
    const short = value.includes("-")
      ? value.split("-")[0].toUpperCase()
      : value.slice(0, 8).toUpperCase();
    return (
      <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5">
        {short}
      </span>
    );
  }

  // ── Currency ─────────────────────────────────────────────────────────────
  if (kind === "currency" && typeof value === "number") {
    return (
      <span className="font-bold text-slate-900">
        ৳{value.toLocaleString("en-BD", { minimumFractionDigits: 2 })}
      </span>
    );
  }

  // ── Percent ──────────────────────────────────────────────────────────────
  if (kind === "percent" && typeof value === "number") {
    return <span className="font-semibold text-slate-700">{value}%</span>;
  }

  // ── Rating ───────────────────────────────────────────────────────────────
  if (kind === "rating" && typeof value === "number") {
    const color = value >= 4.5 ? "text-emerald-600" : value >= 3 ? "text-amber-600" : "text-rose-600";
    return (
      <span className={`font-bold ${color}`}>
        ★ {value.toFixed(1)}
      </span>
    );
  }

  // ── Object (e.g. user: { fullName, email }) ───────────────────────────────
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const display = obj.fullName ?? obj.name ?? obj.title ?? JSON.stringify(value);
    return <span className="text-sm text-slate-700">{String(display)}</span>;
  }

  // ── Date string ──────────────────────────────────────────────────────────
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return (
      <span className="text-xs text-slate-500">
        {new Date(value).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </span>
    );
  }

  // ── Default ──────────────────────────────────────────────────────────────
  return (
    <span className="text-sm text-slate-700">
      {String(value ?? "—")}
    </span>
  );
}
