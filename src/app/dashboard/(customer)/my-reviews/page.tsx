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
import { motion } from "framer-motion";

import { ReviewCard }        from "@/components/dashboard/(customer)/reviews/ReviewCard";
import { WriteReviewDialog } from "@/components/dashboard/(customer)/reviews/WriteReviewDialog";
import { ViewReviewDialog }  from "@/components/dashboard/(customer)/reviews/ViewReviewDialog";
import { SummarySkeletons, CardSkeletons } from "@/components/dashboard/(customer)/reviews/ReviewSkeletons";
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-orange-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-amber-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-amber-200 text-xs font-black uppercase tracking-widest">
                Service Ratings &amp; Feedback
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              My Service Reviews
            </h1>
            <p className="text-amber-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Rate your completed laundry orders and share your experience to help us maintain top quality standards.
            </p>
          </div>

          {!loading && !error && reviewed > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-amber-200 text-[10px] font-black uppercase tracking-wider">Avg Rating</p>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <p className="text-white font-black text-xl leading-tight">{avg.toFixed(1)}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-amber-200 text-[10px] font-black uppercase tracking-wider">Submitted</p>
                <p className="text-white font-black text-2xl mt-0.5">{reviewed}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Stat Cards Grid ──────────────────────────────────────────────── */}
      {loading ? <SummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {([
            { label: "Completed Orders",  sub: "Delivered laundry",      value: items.length,                   Icon: PackageCheck, gradient: "from-indigo-500 to-purple-600" },
            { label: "Reviews Given",     sub: "Ratings submitted",       value: reviewed,                       Icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600" },
            { label: "Pending Feedback",  sub: "Awaiting your review",    value: pending,                        Icon: Clock,        gradient: "from-amber-400 to-orange-500" },
            { label: "Average Score",     sub: "Across all reviews",      value: avg > 0 ? avg.toFixed(1) : "—", Icon: BarChart3,    gradient: "from-rose-500 to-pink-600" },
          ] as const).map(({ label, sub, value, Icon, gradient }) => (
            <motion.div
              key={label}
              whileHover={{ y: -3 }}
              className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${gradient} absolute top-0 left-0 right-0`} />
              <div className="flex items-center gap-4 pt-1">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{value as string | number}</p>
                  <p className="mt-1 text-xs font-black text-slate-700 dark:text-slate-200 leading-tight">{label}</p>
                  <p className="text-[11px] font-medium text-slate-400 leading-tight">{sub}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── 3. Toolbar: Search & Rating Filters ──────────────────────────────── */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or service..."
              className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 h-10 dark:bg-slate-800 dark:border-slate-700">
              <Filter size={13} className="text-slate-400" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={0}>All Ratings</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 h-10 dark:bg-slate-800 dark:border-slate-700">
              <CheckCircle2 size={13} className="text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending</option>
                <option value="UNREVIEWED">Not Reviewed</option>
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 h-10 dark:bg-slate-800 dark:border-slate-700">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
              </select>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="h-10 px-3 rounded-xl text-xs font-extrabold text-slate-500 hover:text-rose-600 gap-1.5"
              >
                <RotateCcw size={13} /> Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Content / Reviews Grid ────────────────────────────────────────── */}
      {loading ? (
        <CardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">Could not load your reviews</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Check your connection and try again.</p>
          <Button onClick={loadReviews} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-slate-200">
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-24 text-center dark:bg-slate-900 dark:border-slate-800">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 dark:bg-amber-950/50">
            <Inbox size={38} />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white">No Reviews Submitted Yet</p>
          <p className="mt-1.5 max-w-xs text-xs text-slate-400 font-medium">
            Once your laundry orders are delivered, you can rate and review your experience here.
          </p>
          <Link href="/dashboard/my-orders">
            <Button className="mt-6 h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 gap-2">
              <ShoppingBag size={16} /> View My Orders
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayed.map((item) => (
              <ReviewCard key={item.orderId} item={item} onWrite={setWriteItem} onView={setViewItem} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronLeft size={16} />
              </button>

              {buildPages(safePage, totalPages).map((pg, idx) =>
                pg === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-xs font-bold text-slate-400">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className={`h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5 ${
                      safePage === pg
                        ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/30"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <ChevronRight size={16} />
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
    </motion.div>
  );
}
