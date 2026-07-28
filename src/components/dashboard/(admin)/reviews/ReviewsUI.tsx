"use client";

import { Star, MessageSquare, TrendingUp, CheckCircle2, EyeOff, Eye, Trash2, Loader2, Search, ArrowUpDown, Filter, RotateCcw, AlertCircle, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  status: string;
}

export type SortKey = "newest" | "oldest" | "highest" | "lowest";

// ─── Sk ──────────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

// ─── StarDisplay ─────────────────────────────────────────────────────────────

export function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          className={s <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"} />
      ))}
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cfg: Record<string, { cls: string; dot: string }> = {
    PUBLISHED: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    HIDDEN:    { cls: "bg-slate-100 text-slate-500 border-slate-200",       dot: "bg-slate-400"  },
    PENDING:   { cls: "bg-amber-50 text-amber-700 border-amber-200",        dot: "bg-amber-500"  },
  };
  const { cls, dot } = cfg[s] ?? cfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── SummaryCards ─────────────────────────────────────────────────────────────

interface SummaryProps { total: number; avg: number; published: number; hidden: number; loading: boolean; }

export function SummaryCards({ total, avg, published, hidden, loading }: SummaryProps) {
  if (loading) return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0,1,2,3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4">
          <Sk className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1"><Sk className="h-6 w-12" /><Sk className="h-3 w-24" /></div>
        </div>
      ))}
    </div>
  );
  const cards = [
    { label: "Total Reviews",  sub: "All submitted reviews",   value: total,                      Icon: MessageSquare, bg: "bg-violet-50",  color: "text-violet-600", ring: "ring-violet-100"  },
    { label: "Average Rating", sub: "Platform-wide average",   value: avg > 0 ? avg.toFixed(1) : "—", Icon: BarChart3, bg: "bg-amber-50",   color: "text-amber-500",  ring: "ring-amber-100"   },
    { label: "Published",      sub: "Visible to customers",    value: published,                  Icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600",ring: "ring-emerald-100" },
    { label: "Hidden",         sub: "Hidden from customers",   value: hidden,                     Icon: EyeOff,       bg: "bg-slate-100",  color: "text-slate-500",  ring: "ring-slate-200"   },
  ] as const;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, sub, value, Icon, bg, color, ring }) => (
        <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${bg} ${color} ${ring}`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-slate-900 leading-none">{value as string | number}</p>
            <p className="mt-0.5 text-[12px] font-semibold text-slate-700 leading-tight">{label}</p>
            <p className="text-[11px] text-slate-400 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── AnalyticsAndFilters ──────────────────────────────────────────────────────

interface FiltersProps {
  avg: number; total: number; dist: { star: number; count: number }[];
  filtered: number;
  search: string; onSearch: (v: string) => void;
  filterRating: number; onRating: (v: number) => void;
  filterStatus: string; onStatus: (v: string) => void;
  sort: SortKey; onSort: (v: SortKey) => void;
  hasFilters: boolean; onClear: () => void;
}

export function AnalyticsAndFilters({ avg, total, dist, filtered, search, onSearch, filterRating, onRating, filterStatus, onStatus, sort, onSort, hasFilters, onClear }: FiltersProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Rating distribution */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-1">
        <CardHeader className="border-b border-slate-50 px-5 py-4">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp size={15} className="text-violet-500" /> Rating Distribution
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">Breakdown by star rating</CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl font-extrabold text-slate-900">{avg > 0 ? avg.toFixed(1) : "—"}</span>
            <div>
              <StarDisplay value={avg} size={16} />
              <p className="text-[11px] text-slate-400 mt-0.5">{total} reviews</p>
            </div>
          </div>
          {dist.map(({ star, count }) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex w-12 shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
                  {star} <Star size={11} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-slate-500">{count}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
        <CardHeader className="border-b border-slate-50 px-5 py-4">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter size={14} className="text-slate-400" /> Filter &amp; Search
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-0.5">{filtered} of {total} reviews</CardDescription>
        </CardHeader>
        <CardContent className="px-5 py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
              placeholder="Search customer name or comment..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <select value={filterRating} onChange={(e) => onRating(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option value={0}>All Ratings</option>
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r>1?"s":""}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <CheckCircle2 size={12} className="text-slate-400" />
              <select value={filterStatus} onChange={(e) => onStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="HIDDEN">Hidden</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select value={sort} onChange={(e) => onSort(e.target.value as SortKey)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
            {hasFilters && (
              <Button size="sm" variant="ghost" onClick={onClear}
                className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-1.5">
                <RotateCcw size={12} /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ReviewsTable ─────────────────────────────────────────────────────────────

interface TableProps {
  displayed: Review[]; loading: boolean; error: boolean;
  hasFilters: boolean; filteredCount: number;
  actionLoading: boolean;
  onLoad: () => void; onClear: () => void;
  onView: (r: Review) => void;
  onToggle: (r: Review) => void;
  onDelete: (id: string) => void;
}

export function ReviewsTable({ displayed, loading, error, hasFilters, filteredCount, actionLoading, onLoad, onClear, onView, onToggle, onDelete }: TableProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/40 px-6 py-4">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">All Reviews</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {loading ? "Loading…" : `Showing ${displayed.length} of ${filteredCount} reviews`}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="divide-y divide-slate-50">
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
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
              <AlertCircle size={22} className="text-rose-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Could not load reviews</p>
            <p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p>
            <Button size="sm" variant="outline" onClick={onLoad} className="mt-3 rounded-xl border-slate-200 text-xs font-bold">Retry</Button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare size={22} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No reviews found</p>
            <p className="mt-1 text-xs text-slate-400">{hasFilters ? "Try adjusting your filters." : "No reviews have been submitted yet."}</p>
            {hasFilters && (
              <Button size="sm" variant="outline" onClick={onClear} className="mt-3 rounded-xl border-slate-200 text-xs font-bold gap-1">
                <RotateCcw size={12} /> Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/60">
                <tr>
                  {["Customer", "Rating", "Comment", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3.5 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700">
                          {r.customer.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 truncate max-w-[120px]">{r.customer}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        <StarDisplay value={r.rating} size={13} />
                        <span className="font-bold text-slate-700">{r.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[280px]">
                      <p className="text-slate-600 leading-relaxed line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="px-5 py-3.5 min-w-[110px]"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => onView(r)}
                          className="h-7 rounded-lg px-2.5 text-[11px] font-semibold text-slate-500 hover:text-violet-600 hover:bg-violet-50 gap-1">
                          <Eye size={12} /> View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onToggle(r)} disabled={actionLoading}
                          className={`h-7 rounded-lg px-2.5 text-[11px] font-semibold gap-1 ${r.status.toUpperCase() === "PUBLISHED" ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50" : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                          {r.status.toUpperCase() === "PUBLISHED" ? <><EyeOff size={12} /> Hide</> : <><CheckCircle2 size={12} /> Publish</>}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)} disabled={actionLoading}
                          className="h-7 rounded-lg px-2.5 text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-1">
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
      </CardContent>
    </Card>
  );
}

// ─── Dialogs ──────────────────────────────────────────────────────────────────

export function ViewDetailDialog({ review, open, onClose }: { review: Review | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900">Review Details</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">Submitted by {review?.customer}</DialogDescription>
        </DialogHeader>
        {review && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarDisplay value={review.rating} size={20} />
                <span className="text-lg font-extrabold text-slate-900">{review.rating.toFixed(1)}</span>
              </div>
              <StatusBadge status={review.status} />
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <p className="text-sm leading-relaxed text-slate-700">{review.comment}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <MessageSquare size={13} className="text-slate-400" />
                <span className="font-medium">Customer: <span className="text-slate-700">{review.customer}</span></span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-medium">Rating: <span className="text-slate-700">{review.rating} / 5</span></span>
              </div>
            </div>
          </div>
        )}
        <DialogFooter className="pt-1">
          <Button variant="outline" onClick={onClose} className="w-full rounded-xl border-slate-200 text-xs font-bold">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteConfirmDialog({ open, loading, onClose, onConfirm }: { open: boolean; loading: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900">Delete Review</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">This action cannot be undone. The review will be permanently removed.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200 text-xs font-bold">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading} className="rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700">
            {loading ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <Trash2 size={13} className="mr-1.5" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
