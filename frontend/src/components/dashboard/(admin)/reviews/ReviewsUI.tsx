"use client";

import {
  Star, MessageSquare, TrendingUp, CheckCircle2,
  EyeOff, Eye, Trash2, Loader2, Search, ArrowUpDown,
  Filter, RotateCcw, AlertCircle, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Review {
  id:       string;
  customer: string;
  rating:   number;
  comment:  string;
  status:   string;
}

export type SortKey = "newest" | "oldest" | "highest" | "lowest";

// ─── Sk ───────────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

// ─── StarDisplay ──────────────────────────────────────────────────────────────

export function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(value)
              ? "fill-warning text-warning"
              : "fill-muted text-border"
          }
        />
      ))}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cfg: Record<string, { cls: string; dot: string }> = {
    PUBLISHED: {
      cls: "bg-success/10 text-success border-success/25 dark:bg-success/15 dark:border-success/30",
      dot: "bg-success",
    },
    HIDDEN: {
      cls: "bg-muted text-muted-foreground border-border",
      dot: "bg-muted-foreground/50",
    },
    PENDING: {
      cls: "bg-warning/10 text-warning border-warning/25 dark:bg-warning/15 dark:border-warning/30",
      dot: "bg-warning animate-pulse",
    },
  };
  const { cls, dot } = cfg[s] ?? cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

// ─── SummaryCards ─────────────────────────────────────────────────────────────

interface SummaryProps {
  total: number; avg: number;
  published: number; hidden: number;
  loading: boolean;
}

export function SummaryCards({ total, avg, published, hidden, loading }: SummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
            <Sk className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Sk className="h-6 w-12" />
              <Sk className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Reviews",
      sub:   "All submitted reviews",
      value: total,
      Icon:  MessageSquare,
      gradient: "from-primary to-indigo-700",
    },
    {
      label: "Average Rating",
      sub:   "Platform-wide average",
      value: avg > 0 ? avg.toFixed(1) : "—",
      Icon:  BarChart3,
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: "Published",
      sub:   "Visible to customers",
      value: published,
      Icon:  CheckCircle2,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Hidden",
      sub:   "Hidden from customers",
      value: hidden,
      Icon:  EyeOff,
      gradient: "from-muted-foreground to-muted-foreground",
    },
  ] as const;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {cards.map(({ label, sub, value, Icon, gradient }) => (
        <motion.div
          key={label}
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } }}
          whileHover={{ y: -3, transition: { duration: 0.16 } }}
          className="group relative overflow-hidden flex items-center gap-4
            rounded-2xl border border-border bg-card p-5 shadow-sm
            hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:border-ring/40
            transition-all duration-300"
        >
          {/* Ambient glow */}
          <div
            className={`pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full
              bg-gradient-to-br ${gradient}
              opacity-0 group-hover:opacity-[0.08] blur-2xl transition-opacity duration-500`}
          />
          {/* Icon */}
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl
            bg-gradient-to-br ${gradient} text-white shadow-md shadow-black/10
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon size={20} strokeWidth={2.2} />
          </div>
          {/* Text */}
          <div className="min-w-0">
            <p className="text-2xl font-black text-card-foreground leading-none tabular-nums">
              {value as string | number}
            </p>
            <p className="mt-0.5 text-[12px] font-black text-card-foreground leading-tight">{label}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{sub}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── AnalyticsAndFilters ──────────────────────────────────────────────────────

interface FiltersProps {
  avg: number; total: number; dist: { star: number; count: number }[];
  filtered: number;
  search: string;       onSearch:  (v: string)  => void;
  filterRating: number; onRating:  (v: number)  => void;
  filterStatus: string; onStatus:  (v: string)  => void;
  sort: SortKey;        onSort:    (v: SortKey) => void;
  hasFilters: boolean;  onClear:   () => void;
}

export function AnalyticsAndFilters({
  avg, total, dist, filtered,
  search, onSearch, filterRating, onRating,
  filterStatus, onStatus, sort, onSort,
  hasFilters, onClear,
}: FiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">

      {/* Rating distribution */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-1">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-black/10">
            <TrendingUp size={16} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-black text-card-foreground">Rating Distribution</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Breakdown by star rating</p>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-black text-card-foreground tabular-nums">
              {avg > 0 ? avg.toFixed(1) : "—"}
            </span>
            <div>
              <StarDisplay value={avg} size={16} />
              <p className="text-[11px] text-muted-foreground mt-0.5">{total} reviews</p>
            </div>
          </div>
          {dist.map(({ star, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex w-12 shrink-0 items-center gap-1 text-xs font-black text-card-foreground">
                  {star} <Star size={11} className="fill-warning text-warning" />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: "var(--warning)" }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-bold text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-md shadow-black/10">
            <Filter size={16} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-black text-card-foreground">Filter &amp; Search</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {filtered} of {total} reviews
            </p>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={13} />
            <input
              type="text" value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search customer name or comment…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-muted text-xs
                font-medium text-card-foreground placeholder:text-muted-foreground/60
                focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition"
            />
          </div>
          {/* Selects row */}
          <div className="flex flex-wrap gap-2">
            {/* Rating filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-9">
              <Star size={12} className="fill-warning text-warning shrink-0" />
              <select
                value={filterRating}
                onChange={(e) => onRating(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value={0}>All Ratings</option>
                {[5,4,3,2,1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-9">
              <CheckCircle2 size={12} className="text-muted-foreground shrink-0" />
              <select
                value={filterStatus}
                onChange={(e) => onStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="HIDDEN">Hidden</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            {/* Sort */}
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 h-9">
              <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
              <select
                value={sort}
                onChange={(e) => onSort(e.target.value as SortKey)}
                className="bg-transparent text-xs font-bold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
            {hasFilters && (
              <Button
                size="sm" variant="ghost" onClick={onClear}
                className="h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-error hover:bg-error/10 gap-1.5"
              >
                <RotateCcw size={12} /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ReviewsTable ─────────────────────────────────────────────────────────────

interface TableProps {
  displayed: Review[]; loading: boolean; error: boolean;
  hasFilters: boolean; filteredCount: number;
  actionLoading: boolean;
  onLoad: () => void; onClear: () => void;
  onView:   (r: Review) => void;
  onToggle: (r: Review) => void;
  onDelete: (id: string) => void;
}

export function ReviewsTable({
  displayed, loading, error, hasFilters, filteredCount,
  actionLoading, onLoad, onClear, onView, onToggle, onDelete,
}: TableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
        <div>
          <p className="text-sm font-black text-card-foreground">All Reviews</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `Showing ${displayed.length} of ${filteredCount} reviews`}
          </p>
        </div>
      </div>

      {/* Body states */}
      {loading ? (
        <div className="divide-y divide-border">
          {[0,1,2,3,4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Sk className="h-8 w-8 rounded-full shrink-0" />
              <Sk className="h-3 flex-1" />
              <Sk className="h-3 w-24" />
              <Sk className="h-5 w-16 rounded-full" />
              <Sk className="h-7 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10">
            <AlertCircle size={22} className="text-error" />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load reviews</p>
          <p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p>
          <Button size="sm" variant="outline" onClick={onLoad}
            className="mt-3 rounded-xl text-xs font-bold">
            Retry
          </Button>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
            <MessageSquare size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-sm font-black text-card-foreground">No reviews found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasFilters ? "Try adjusting your filters." : "No reviews submitted yet."}
          </p>
          {hasFilters && (
            <Button size="sm" variant="outline" onClick={onClear}
              className="mt-3 rounded-xl text-xs font-bold gap-1">
              <RotateCcw size={12} /> Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Customer","Rating","Comment","Status","Actions"].map((h) => (
                  <th key={h}
                    className="px-5 py-3 text-[10.5px] font-black uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map((r) => (
                <tr key={r.id}
                  className="group hover:bg-muted/40 transition-colors duration-150">

                  {/* Customer */}
                  <td className="px-5 py-3.5 min-w-[160px]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                        bg-gradient-to-br from-primary to-indigo-700 text-[11px] font-black text-white shadow-sm">
                        {r.customer.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-bold text-card-foreground truncate max-w-[120px]
                        group-hover:text-primary transition-colors">
                        {r.customer}
                      </span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-5 py-3.5 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <StarDisplay value={r.rating} size={13} />
                      <span className="text-xs font-black text-card-foreground tabular-nums">
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  {/* Comment */}
                  <td className="px-5 py-3.5 max-w-[280px]">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-medium">
                      {r.comment}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 min-w-[110px]">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 min-w-[190px]">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => onView(r)}
                        className="h-8 rounded-xl px-2.5 text-[11px] font-bold text-muted-foreground
                          hover:text-primary hover:bg-primary/10 gap-1 transition-colors">
                        <Eye size={12} /> View
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onToggle(r)} disabled={actionLoading}
                        className={`h-8 rounded-xl px-2.5 text-[11px] font-bold gap-1 transition-colors
                          ${r.status.toUpperCase() === "PUBLISHED"
                            ? "text-muted-foreground hover:text-warning hover:bg-warning/10"
                            : "text-muted-foreground hover:text-success hover:bg-success/10"
                          }`}>
                        {r.status.toUpperCase() === "PUBLISHED"
                          ? <><EyeOff size={12} /> Hide</>
                          : <><CheckCircle2 size={12} /> Publish</>}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)} disabled={actionLoading}
                        className="h-8 rounded-xl px-2.5 text-[11px] font-bold text-muted-foreground
                          hover:text-error hover:bg-error/10 gap-1 transition-colors">
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ViewDetailDialog ─────────────────────────────────────────────────────────

export function ViewDetailDialog({
  review, open, onClose,
}: { review: Review | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-card-foreground">
            Review Details
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submitted by {review?.customer}
          </DialogDescription>
        </DialogHeader>
        {review && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarDisplay value={review.rating} size={20} />
                <span className="text-lg font-black text-card-foreground tabular-nums">
                  {review.rating.toFixed(1)}
                </span>
              </div>
              <StatusBadge status={review.status} />
            </div>
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <p className="text-sm leading-relaxed text-card-foreground">{review.comment}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                <MessageSquare size={13} className="text-muted-foreground/60" />
                <span className="font-medium">
                  Customer: <span className="text-card-foreground font-black">{review.customer}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
                <Star size={13} className="fill-warning text-warning" />
                <span className="font-medium">
                  Rating: <span className="text-card-foreground font-black">{review.rating} / 5</span>
                </span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="pt-1">
          <Button variant="outline" onClick={onClose}
            className="w-full rounded-xl text-xs font-bold">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────

export function DeleteConfirmDialog({
  open, loading, onClose, onConfirm,
}: { open: boolean; loading: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-card-foreground">Delete Review</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This action cannot be undone. The review will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl text-xs font-bold">
            Cancel
          </Button>
          <Button
            onClick={onConfirm} disabled={loading}
            className="rounded-xl bg-gradient-to-br from-error to-rose-600 text-xs font-black text-white hover:opacity-90 gap-1.5"
          >
            {loading
              ? <Loader2 size={13} className="animate-spin" />
              : <Trash2 size={13} />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
