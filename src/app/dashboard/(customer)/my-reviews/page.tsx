"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star, BarChart3, CheckCircle2, Clock, PackageCheck,
  Search, ArrowUpDown, RotateCcw, Filter,
  AlertCircle, ShoppingBag, Inbox, Sparkles,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

import { ReviewCard }        from "@/components/dashboard/(customer)/reviews/ReviewCard";
import { WriteReviewDialog } from "@/components/dashboard/(customer)/reviews/WriteReviewDialog";
import { ViewReviewDialog }  from "@/components/dashboard/(customer)/reviews/ViewReviewDialog";
import { SummarySkeletons, CardSkeletons } from "@/components/dashboard/(customer)/reviews/ReviewSkeletons";
import { StarRating }        from "@/components/dashboard/(customer)/reviews/StarRating";
import {
  OrderReview, ReviewData, SortOption,
  PAGE_SIZE, avgRating, buildPages,
} from "@/components/dashboard/(customer)/reviews/types";

export default function MyReviewsPage() {
  const [items, setItems]         = useState<OrderReview[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [page, setPage]           = useState(1);
  const [writeItem, setWriteItem] = useState<OrderReview | null>(null);
  const [viewItem, setViewItem]   = useState<OrderReview | null>(null);

  const [search, setSearch]             = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sort, setSort]                 = useState<SortOption>("newest");

  // ── data ──────────────────────────────────────────────────────────────────
  const loadReviews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res  = await authFetch("/customer/reviews");
      const data = await res.json();
      if (data.success) setItems(data.data);
      else setError(true);
    } catch (err) {
      console.error(err);
      setError(true);
      toast.error("Failed to load your reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReviews(); }, []);
  useEffect(() => { setPage(1); }, [search, filterRating, filterStatus, sort]);

  const handleReviewSuccess = (orderId: string, review: ReviewData) =>
    setItems((prev) => prev.map((i) => (i.orderId === orderId ? { ...i, review } : i)));

  // ── derived ───────────────────────────────────────────────────────────────
  const reviewed = items.filter((i) => i.review !== null).length;
  const pending  = items.filter((i) => i.review === null).length;
  const avg      = avgRating(items);

  const filtered = useMemo(() => {
    let list = [...items];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.orderNumber.toLowerCase().includes(q) || i.serviceName.toLowerCase().includes(q)
      );
    }
    if (filterRating > 0)
      list = list.filter((i) => i.review && Math.round(i.review.rating) === filterRating);
    if (filterStatus !== "ALL") {
      if (filterStatus === "UNREVIEWED") list = list.filter((i) => !i.review);
      else list = list.filter((i) => i.review?.status.toUpperCase() === filterStatus);
    }
    list.sort((a, b) => {
      if (sort === "oldest")  return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      if (sort === "highest") return (b.review?.rating ?? 0) - (a.review?.rating ?? 0);
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });
    return list;
  }, [items, search, filterRating, filterStatus, sort]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const displayed   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters  = !!search || filterRating > 0 || filterStatus !== "ALL" || sort !== "newest";
  const clearFilters = () => { setSearch(""); setFilterRating(0); setFilterStatus("ALL"); setSort("newest"); setPage(1); };

  return (
    <div className="space-y-7">

      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-7 py-8">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-amber-200" />
              <span className="text-amber-200 text-[11px] font-semibold uppercase tracking-widest">
                Feedback &amp; Ratings
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">My Reviews</h1>
            <p className="mt-1 text-sm text-amber-100">
              Share your experience and rate the laundry services you&apos;ve used.
            </p>
          </div>

          {!loading && !error && reviewed > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-wider">Avg Rating</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Star size={14} className="fill-amber-300 text-amber-300" />
                  <p className="text-white font-extrabold text-xl leading-tight">{avg.toFixed(1)}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-amber-200 text-[10px] font-semibold uppercase tracking-wider">Reviews</p>
                <p className="text-white font-extrabold text-xl leading-tight">{reviewed}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────────── */}
      {loading ? <SummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {([
            { label: "Completed Orders",  sub: "All time completed",        value: items.length,                   Icon: PackageCheck, iconBg: "bg-violet-50",  iconColor: "text-violet-600",  ringColor: "ring-violet-100"  },
            { label: "Reviews Submitted", sub: "Total reviews you gave",     value: reviewed,                       Icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", ringColor: "ring-emerald-100" },
            { label: "Pending Reviews",   sub: "Awaiting your feedback",     value: pending,                        Icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",   ringColor: "ring-amber-100"   },
            { label: "Average Rating",    sub: "Based on your reviews",      value: avg > 0 ? avg.toFixed(1) : "—", Icon: BarChart3,    iconBg: "bg-rose-50",    iconColor: "text-rose-500",    ringColor: "ring-rose-100"    },
          ] as const).map(({ label, sub, value, Icon, iconBg, iconColor, ringColor }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-4 ${iconBg} ${iconColor} ${ringColor}`}>
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

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or service name…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Rating filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <Filter size={12} className="text-slate-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={0}>All Ratings</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <CheckCircle2 size={12} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending</option>
                <option value="UNREVIEWED">Not Reviewed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 h-9">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
              </select>
            </div>

            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 gap-1.5"
              >
                <RotateCcw size={12} /> Clear Filters
              </Button>
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-[11px] text-slate-400 ml-auto">
              Showing <span className="font-semibold text-slate-600">{displayed.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{filtered.length}</span>
            </p>
          )}
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {loading ? (
        <CardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
            <AlertCircle size={26} className="text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Could not load your reviews</p>
          <p className="mt-1 text-xs text-slate-400">Check your connection and try again.</p>
          <Button size="sm" variant="outline" onClick={loadReviews}
            className="mt-4 rounded-xl border-slate-200 text-xs font-bold">
            Retry
          </Button>
        </div>

      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
            <Inbox size={38} className="text-amber-400" />
          </div>
          <p className="text-base font-bold text-slate-800">No reviews yet</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Once your orders are completed, they will appear here for you to review.
          </p>
          <Link href="/dashboard/my-orders">
            <Button className="mt-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white gap-2">
              <ShoppingBag size={14} /> Go to My Orders
            </Button>
          </Link>
        </div>

      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Search size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No results match your filters</p>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your search or filter criteria.</p>
          <Button size="sm" variant="outline" onClick={clearFilters}
            className="mt-4 rounded-xl border-slate-200 text-xs font-bold gap-1.5">
            <RotateCcw size={12} /> Clear Filters
          </Button>
        </div>

      ) : (
        <>
          <div className="space-y-4">
            {displayed.map((item) => (
              <ReviewCard key={item.orderId} item={item} onWrite={setWriteItem} onView={setViewItem} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>

              {buildPages(safePage, totalPages).map((pg, idx) =>
                pg === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-sm text-slate-400">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className={`h-8 min-w-[2rem] rounded-lg border text-xs font-bold transition-all px-2
                      ${safePage === pg
                        ? "border-amber-400 bg-amber-500 text-white shadow-sm shadow-amber-200"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"}`}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}

      <WriteReviewDialog
        item={writeItem}
        open={writeItem !== null}
        onClose={() => setWriteItem(null)}
        onSuccess={handleReviewSuccess}
      />
      <ViewReviewDialog
        item={viewItem}
        open={viewItem !== null}
        onClose={() => setViewItem(null)}
      />
    </div>
  );
}
