"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Star, Search, RotateCcw, Eye, Trash2, EyeOff,
  MessageSquare, TrendingUp, CalendarDays, Flag,
  ChevronLeft, ChevronRight, BarChart3, Loader2,
  AlertCircle, CheckCircle2, Clock, Filter, ArrowUpDown,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  status: string; // "Published" | "Hidden" | "Pending"
}

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function avgOf(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"}
        />
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function SummarySkeletons() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[0,1,2,3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-4">
          <Sk className="h-12 w-12 rounded-2xl shrink-0" />
          <div className="space-y-2 flex-1"><Sk className="h-6 w-12" /><Sk className="h-3 w-24" /></div>
        </div>
      ))}
    </div>
  );
}

// ─── Rating distribution bar ──────────────────────────────────────────────────

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-12 shrink-0 items-center gap-1 text-xs font-semibold text-slate-600">
        {star} <Star size={11} className="fill-amber-400 text-amber-400" />
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs text-slate-500">{count}</span>
    </div>
  );
}

// ─── View Detail Dialog ───────────────────────────────────────────────────────

function ViewDetailDialog({
  review, open, onClose,
}: { review: Review | null; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900">Review Details</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Submitted by {review?.customer}
          </DialogDescription>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomerReviewsPage() {
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sort, setSort]             = useState<SortKey>("newest");
  const [viewReview, setViewReview] = useState<Review | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── fetch ──
  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch("/support/reviews?limit=1000");
      const data = await res.json();
      if (data.success) setReviews(data.data);
      else setError(true);
    } catch { setError(true); toast.error("Failed to load reviews."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, filterRating, filterStatus, sort]);

  // ── actions ──
  const handleToggleStatus = async (r: Review) => {
    const next = r.status.toUpperCase() === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
    setActionLoading(true);
    try {
      const res  = await authFetch(`/support/reviews/${r.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Review ${next === "HIDDEN" ? "hidden" : "published"} successfully.`);
        setReviews((prev) => prev.map((x) =>
          x.id === r.id ? { ...x, status: next === "PUBLISHED" ? "Published" : "Hidden" } : x
        ));
      } else toast.error(data.message || "Failed to update status.");
    } catch { toast.error("Something went wrong."); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const res  = await authFetch(`/support/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted.");
        setReviews((prev) => prev.filter((x) => x.id !== id));
        setDeletingId(null);
      } else toast.error(data.message || "Failed to delete.");
    } catch { toast.error("Something went wrong."); }
    finally { setActionLoading(false); }
  };

  // ── derived stats ──
  const total     = reviews.length;
  const avg       = avgOf(reviews);
  const published = reviews.filter((r) => r.status.toUpperCase() === "PUBLISHED").length;
  const hidden    = reviews.filter((r) => r.status.toUpperCase() === "HIDDEN").length;
  const dist      = [5,4,3,2,1].map((s) => ({
    star: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
  }));

  // ── filtered list ──
  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.customer.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
      );
    }
    if (filterRating > 0) list = list.filter((r) => Math.round(r.rating) === filterRating);
    if (filterStatus !== "ALL") list = list.filter((r) => r.status.toUpperCase() === filterStatus);
    list.sort((a, b) => {
      if (sort === "oldest")  return a.id.localeCompare(b.id);
      if (sort === "highest") return b.rating - a.rating;
      if (sort === "lowest")  return a.rating - b.rating;
      return b.id.localeCompare(a.id);
    });
    return list;
  }, [reviews, search, filterRating, filterStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const displayed  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = !!search || filterRating > 0 || filterStatus !== "ALL" || sort !== "newest";
  const clearFilters = () => { setSearch(""); setFilterRating(0); setFilterStatus("ALL"); setSort("newest"); };

  function buildPages(cur: number, tot: number): (number | "…")[] {
    if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
    if (cur <= 3) return [1, 2, 3, "…", tot];
    if (cur >= tot - 2) return [1, "…", tot - 2, tot - 1, tot];
    return [1, "…", cur - 1, cur, cur + 1, "…", tot];
  }

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Customer Reviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, moderate, and manage all customer reviews across the platform.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star size={20} className="fill-amber-400" />
        </div>
      </div>

      {/* ── Summary cards ── */}
      {loading ? <SummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {([
            { label: "Total Reviews",    sub: "All submitted reviews",    value: total,           Icon: MessageSquare, bg: "bg-violet-50",  color: "text-violet-600", ring: "ring-violet-100"  },
            { label: "Average Rating",   sub: "Platform-wide average",    value: avg > 0 ? avg.toFixed(1) : "—", Icon: BarChart3, bg: "bg-amber-50",   color: "text-amber-500",  ring: "ring-amber-100"   },
            { label: "Published",        sub: "Visible to customers",     value: published,       Icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600",ring: "ring-emerald-100" },
            { label: "Hidden",           sub: "Hidden from customers",    value: hidden,          Icon: EyeOff,       bg: "bg-slate-100",  color: "text-slate-500",  ring: "ring-slate-200"   },
          ] as const).map(({ label, sub, value, Icon, bg, color, ring }) => (
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
      )}

      {/* ── Analytics + Toolbar row ── */}
      {!loading && !error && reviews.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Rating distribution */}
          <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-1">
            <CardHeader className="border-b border-slate-50 px-5 py-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-500" /> Rating Distribution
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Breakdown by star rating
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{avg > 0 ? avg.toFixed(1) : "—"}</span>
                <div>
                  <StarDisplay value={avg} size={16} />
                  <p className="text-[11px] text-slate-400 mt-0.5">{total} reviews</p>
                </div>
              </div>
              {dist.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={total} />
              ))}
            </CardContent>
          </Card>

          {/* Toolbar card */}
          <Card className="rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <CardHeader className="border-b border-slate-50 px-5 py-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter size={14} className="text-slate-400" /> Filter &amp; Search
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                {filtered.length} of {total} reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 py-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer name or comment..."
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Rating */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <select value={filterRating} onChange={(e) => setFilterRating(Number(e.target.value))}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                    <option value={0}>All Ratings</option>
                    {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r>1?"s":""}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
                  <CheckCircle2 size={12} className="text-slate-400" />
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                    <option value="ALL">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="HIDDEN">Hidden</option>
                    <option value="PENDING">Pending</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
                  <ArrowUpDown size={12} className="text-slate-400" />
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
                    className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>

                {hasFilters && (
                  <Button size="sm" variant="ghost" onClick={clearFilters}
                    className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-1.5">
                    <RotateCcw size={12} /> Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Reviews Table ── */}
      <Card className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 bg-slate-50/40 px-6 py-4">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">All Reviews</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              {loading ? "Loading…" : `Showing ${displayed.length} of ${filtered.length} reviews`}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0 divide-y divide-slate-50">
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
              <Button size="sm" variant="outline" onClick={load}
                className="mt-3 rounded-xl border-slate-200 text-xs font-bold">Retry</Button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <MessageSquare size={22} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No reviews found</p>
              <p className="mt-1 text-xs text-slate-400">
                {hasFilters ? "Try adjusting your filters." : "No reviews have been submitted yet."}
              </p>
              {hasFilters && (
                <Button size="sm" variant="outline" onClick={clearFilters}
                  className="mt-3 rounded-xl border-slate-200 text-xs font-bold gap-1">
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
                      <th key={h} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayed.map((r) => (
                    <tr key={r.id} className="group hover:bg-slate-50/40 transition-colors">

                      {/* Customer */}
                      <td className="px-5 py-3.5 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[12px] font-bold text-violet-700">
                            {r.customer.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 truncate max-w-[120px]">{r.customer}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-3.5 min-w-[120px]">
                        <div className="flex items-center gap-1.5">
                          <StarDisplay value={r.rating} size={13} />
                          <span className="font-bold text-slate-700">{r.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="px-5 py-3.5 max-w-[280px]">
                        <p className="text-slate-600 leading-relaxed line-clamp-2">{r.comment}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 min-w-[110px]">
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 min-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="ghost"
                            onClick={() => setViewReview(r)}
                            className="h-7 rounded-lg px-2.5 text-[11px] font-semibold text-slate-500 hover:text-violet-600 hover:bg-violet-50 gap-1">
                            <Eye size={12} /> View
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => handleToggleStatus(r)}
                            disabled={actionLoading}
                            className={`h-7 rounded-lg px-2.5 text-[11px] font-semibold gap-1 ${
                              r.status.toUpperCase() === "PUBLISHED"
                                ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                                : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            }`}>
                            {r.status.toUpperCase() === "PUBLISHED"
                              ? <><EyeOff size={12} /> Hide</>
                              : <><CheckCircle2 size={12} /> Publish</>}
                          </Button>
                          <Button size="sm" variant="ghost"
                            onClick={() => setDeletingId(r.id)}
                            disabled={actionLoading}
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

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {safePage} of {totalPages} &middot; {filtered.length} reviews
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl border-slate-200 px-3 text-xs font-bold gap-1 disabled:opacity-40">
              <ChevronLeft size={13} /> Previous
            </Button>
            {buildPages(safePage, totalPages).map((pg, idx) =>
              pg === "…" ? (
                <span key={`e-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
              ) : (
                <button key={pg} onClick={() => setPage(pg as number)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                    safePage === pg
                      ? "bg-violet-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                  }`}>
                  {pg}
                </button>
              )
            )}
            <Button size="sm" variant="outline" disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 rounded-xl border-slate-200 px-3 text-xs font-bold gap-1 disabled:opacity-40">
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* ── View Detail Dialog ── */}
      <ViewDetailDialog review={viewReview} open={viewReview !== null} onClose={() => setViewReview(null)} />

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">Delete Review</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              This action cannot be undone. The review will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}
              className="rounded-xl border-slate-200 text-xs font-bold">Cancel</Button>
            <Button onClick={() => deletingId && handleDelete(deletingId)} disabled={actionLoading}
              className="rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700">
              {actionLoading ? <Loader2 size={13} className="mr-1.5 animate-spin" /> : <Trash2 size={13} className="mr-1.5" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
