"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star, BarChart3, CheckCircle2, Clock, PackageCheck,
  Search, ArrowUpDown, RotateCcw, Filter,
  AlertCircle, ShoppingBag, Inbox,
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
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import { OverviewStatCard }  from "@/components/dashboard/shared/overview/OverviewStatCard";

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

  // ── Data ────────────────────────────────────────────────────────────────────

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

  // ── Derived ─────────────────────────────────────────────────────────────────

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

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage     = Math.min(page, totalPages);
  const displayed    = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters   = !!search || filterRating > 0 || filterStatus !== "ALL" || sort !== "newest";
  const clearFilters = () => { setSearch(""); setFilterRating(0); setFilterStatus("ALL"); setSort("newest"); setPage(1); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Service Ratings & Feedback"
        title="My Service Reviews"
        description="Rate your completed laundry orders and share your experience to help us maintain top quality standards."
        icon={Star}
      />

      {/* ── 2. Stat Cards ────────────────────────────────────────────────────── */}
      {loading ? <SummarySkeletons /> : !error && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <OverviewStatCard label="Completed Orders" sub="Delivered laundry"   value={items.length}                   icon={PackageCheck} gradient="from-indigo-500 to-purple-600" />
          <OverviewStatCard label="Reviews Given"    sub="Ratings submitted"   value={reviewed}                       icon={CheckCircle2} gradient="from-emerald-500 to-teal-600"  />
          <OverviewStatCard label="Pending Feedback" sub="Awaiting your review" value={pending}                       icon={Clock}        gradient="from-amber-400 to-orange-500"  />
          <OverviewStatCard label="Average Score"    sub="Across all reviews"   value={avg > 0 ? avg.toFixed(1) : "—"} icon={BarChart3}   gradient="from-rose-500 to-pink-600"     />
        </div>
      )}

      {/* ── 3. Toolbar ───────────────────────────────────────────────────────── */}
      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap rounded-3xl border border-border bg-card p-5 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or service..."
              className="w-full h-10 rounded-2xl border border-border bg-muted/50 pl-10 pr-4 text-xs font-bold text-card-foreground placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Rating filter */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3.5 h-10">
              <Filter size={13} className="text-muted-foreground" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(Number(e.target.value))}
                className="bg-transparent text-xs font-extrabold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value={0}>All Ratings</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3.5 h-10">
              <CheckCircle2 size={13} className="text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="PENDING">Pending</option>
                <option value="UNREVIEWED">Not Reviewed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/50 px-3.5 h-10">
              <ArrowUpDown size={13} className="text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent text-xs font-extrabold text-card-foreground focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
              </select>
            </div>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="h-10 px-3 rounded-xl text-xs font-extrabold text-muted-foreground hover:text-error gap-1.5">
                <RotateCcw size={13} /> Reset
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 4. Content ───────────────────────────────────────────────────────── */}
      {loading ? (
        <CardSkeletons />
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error/10 text-error">
            <AlertCircle size={26} />
          </div>
          <p className="text-sm font-black text-card-foreground">Could not load your reviews</p>
          <p className="mt-1 text-xs text-muted-foreground font-medium">Check your connection and try again.</p>
          <Button onClick={loadReviews} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-extrabold border-border">
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
            <Inbox size={38} style={{ color: "var(--primary)" }} />
          </div>
          <p className="text-lg font-black text-card-foreground">No Reviews Submitted Yet</p>
          <p className="mt-1.5 max-w-xs text-xs text-muted-foreground font-medium">
            Once your laundry orders are delivered, you can rate and review your experience here.
          </p>
          <Link href="/dashboard/my-orders">
            <Button
              className="mt-6 h-11 px-6 rounded-2xl text-white font-black text-xs shadow-lg gap-2"
              style={{ background: "linear-gradient(135deg, var(--primary), var(--ring))" }}
            >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>

              {buildPages(safePage, totalPages).map((pg, idx) =>
                pg === "…" ? (
                  <span key={`e-${idx}`} className="px-1 text-xs font-bold text-muted-foreground">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => setPage(pg as number)}
                    className="h-9 min-w-[2.25rem] rounded-xl border text-xs font-black transition-all px-2.5"
                    style={safePage === pg ? {
                      background: "var(--primary)",
                      borderColor: "var(--primary)",
                      color: "white",
                    } : undefined}
                  >
                    {pg}
                  </button>
                )
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-card-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
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
