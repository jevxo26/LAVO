"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpsColumn<T> {
  /** Column header label */
  header:  string;
  /** Key for grid-cols sizing, e.g. "minmax(160px,2fr)" or "1fr" or "130px" */
  width:   string;
  /** Render function for this cell */
  render:  (row: T, idx: number) => React.ReactNode;
}

export interface OpsTableFooterStat {
  dot?:   string;           // Tailwind class for the dot color, e.g. "bg-success"
  icon?:  React.ReactNode;  // Alternative: icon instead of dot
  label:  string;
  value?: string | number;
  pulse?: boolean;          // animate-pulse on dot
}

interface OpsTableProps<T> {
  /** Unique key per row */
  keyExtractor:    (row: T) => string;
  /** Column definitions */
  columns:         OpsColumn<T>[];
  /** Filtered + sorted data to display */
  displayed:       T[];
  /** Total count before filtering (for footer "X of Y") */
  totalCount:      number;
  /** Label for the entity, e.g. "machines", "vehicles", "batches" */
  noun?:           string;
  /** Empty state — primary message */
  emptyTitle?:     string;
  /** Empty state — secondary message when filtered */
  emptyFiltered?:  string;
  /** Empty state — secondary message when no data at all */
  emptyDefault?:   string;
  /** Whether filters are active (shows Clear Filters button) */
  hasFilters?:     boolean;
  /** Callback for Clear Filters button */
  onClearFilters?: () => void;
  /** Footer right-side stat chips */
  footerStats?:    OpsTableFooterStat[];
  /** Animate key — change to re-trigger fade-in (e.g. activeTab + search) */
  animateKey?:     string;
}

// ─── OpsTable ─────────────────────────────────────────────────────────────────

export function OpsTable<T>({
  keyExtractor,
  columns,
  displayed,
  totalCount,
  noun           = "records",
  emptyTitle     = "No data found",
  emptyFiltered  = "Try adjusting your filters.",
  emptyDefault   = "No data available.",
  hasFilters     = false,
  onClearFilters,
  footerStats,
  animateKey     = "",
}: OpsTableProps<T>) {
  // Build the CSS grid-template-columns string from column widths
  const gridCols = columns.map((c) => c.width).join(" ");
  const gridStyle = { gridTemplateColumns: gridCols };

  return (
    <motion.div
      key={animateKey}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* ── Column headers ──────────────────────────────────────────────── */}
      <div className="border-b border-border bg-muted/50">
        <div className="grid px-5 py-3 gap-4" style={gridStyle}>
          {columns.map((col) => (
            <p
              key={col.header}
              className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground"
            >
              {col.header}
            </p>
          ))}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <Search size={20} className="text-muted-foreground/30" />
          </div>
          <p className="text-sm font-black text-card-foreground">{emptyTitle}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasFilters ? emptyFiltered : emptyDefault}
          </p>
          {hasFilters && onClearFilters && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClearFilters}
              className="mt-3 rounded-xl text-xs font-bold gap-1"
            >
              <RotateCcw size={12} /> Clear Filters
            </Button>
          )}
        </div>
      ) : (

        /* ── Body rows ──────────────────────────────────────────────────── */
        <div className="divide-y divide-border overflow-x-auto">
          {displayed.map((row, idx) => (
            <motion.div
              key={keyExtractor(row)}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="group grid px-5 py-4 gap-4 items-center hover:bg-muted/40 transition-colors duration-150"
              style={gridStyle}
            >
              {columns.map((col) => (
                <React.Fragment key={col.header}>
                  {col.render(row, idx)}
                </React.Fragment>
              ))}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3">
        {/* Left — showing X of Y */}
        <p className="text-[11px] text-muted-foreground font-medium">
          Showing{" "}
          <span className="font-black text-card-foreground">{displayed.length}</span>
          {" "}of{" "}
          <span className="font-black text-card-foreground">{totalCount}</span>
          {" "}{noun}
        </p>

        {/* Right — stat chips */}
        {footerStats && footerStats.length > 0 && (
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
            {footerStats.map((stat, i) => (
              <span key={i} className="flex items-center gap-1">
                {stat.icon ? (
                  stat.icon
                ) : stat.dot ? (
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stat.dot}${stat.pulse ? " animate-pulse" : ""}`} />
                ) : null}
                {stat.value !== undefined ? (
                  <>
                    <span className="font-black text-card-foreground tabular-nums">{stat.value}</span>
                    {" "}{stat.label}
                  </>
                ) : (
                  stat.label
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
