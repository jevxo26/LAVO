"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/components/dashboard/(admin)/reviews/useReviews";
import { DashboardPageHero } from "@/components/shared/DashboardPageHero";
import {
  SummaryCards,
  AnalyticsAndFilters,
  ReviewsTable,
  ViewDetailDialog,
  DeleteConfirmDialog,
} from "@/components/dashboard/(admin)/reviews/ReviewsUI";

export default function CustomerReviewsPage() {
  const r = useReviews();

  // Resolution rate for hero chip
  const resolutionRate = r.total > 0
    ? `${Math.round((r.published / r.total) * 100)}%`
    : "—";

  return (
    <div className="space-y-7">

      {/* ── 1. Hero ──────────────────────────────────────────────────────────── */}
      <DashboardPageHero
        badge="Customer Operations"
        title="Customer Reviews"
        description="Monitor, moderate, and manage all customer reviews across the platform. Publish, hide, and respond to maintain service quality."
        icon={Star}
        liveLabel="Moderation Centre"
        chips={[
          {
            label: "Total Reviews",
            value: r.loading ? "—" : r.total,
            sub:   r.total > 0 ? `${resolutionRate} published` : "No reviews yet",
          },
          {
            label: "Avg Rating",
            value: r.loading ? "—" : r.avg > 0 ? r.avg.toFixed(1) : "—",
            sub:   "Platform average",
          },
          {
            label: "Hidden",
            value: r.loading ? "—" : r.hidden,
            sub:   r.hidden > 0 ? "Awaiting review" : "All clear",
          },
        ]}
      />

      {/* ── 2. Summary cards ─────────────────────────────────────────────────── */}
      <SummaryCards
        total={r.total}
        avg={r.avg}
        published={r.published}
        hidden={r.hidden}
        loading={r.loading}
      />

      {/* ── 3. Analytics + Filters ───────────────────────────────────────────── */}
      {!r.loading && !r.error && r.total > 0 && (
        <AnalyticsAndFilters
          avg={r.avg}           total={r.total}         dist={r.dist}
          filtered={r.filtered}
          search={r.search}           onSearch={r.setSearch}
          filterRating={r.filterRating} onRating={r.setFilterRating}
          filterStatus={r.filterStatus} onStatus={r.setFilterStatus}
          sort={r.sort}               onSort={r.setSort}
          hasFilters={r.hasFilters}   onClear={r.clearFilters}
        />
      )}

      {/* ── 4. Table ─────────────────────────────────────────────────────────── */}
      <ReviewsTable
        displayed={r.displayed}
        loading={r.loading}     error={r.error}
        hasFilters={r.hasFilters} filteredCount={r.filtered}
        actionLoading={r.actionLoading}
        onLoad={r.load}         onClear={r.clearFilters}
        onView={r.setViewReview}
        onToggle={r.handleToggleStatus}
        onDelete={r.setDeletingId}
      />

      {/* ── 5. Pagination ─────────────────────────────────────────────────────── */}
      {!r.loading && !r.error && r.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground tabular-nums">
            Page <span className="font-black text-card-foreground">{r.safePage}</span>
            {" "}of{" "}
            <span className="font-black text-card-foreground">{r.totalPages}</span>
            {" · "}
            <span className="font-black text-card-foreground">{r.filtered}</span> reviews
          </p>

          <div className="flex items-center gap-1">
            <Button
              size="sm" variant="outline"
              disabled={r.safePage === 1}
              onClick={() => r.setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl px-3 text-xs font-bold gap-1 disabled:opacity-40"
            >
              <ChevronLeft size={13} /> Previous
            </Button>

            {r.buildPages(r.safePage, r.totalPages).map((pg, idx) =>
              pg === "…" ? (
                <span key={`e-${idx}`} className="px-1 text-muted-foreground text-xs">…</span>
              ) : (
                <button
                  key={pg}
                  onClick={() => r.setPage(pg as number)}
                  className={`h-8 w-8 rounded-xl text-xs font-black transition-all ${
                    r.safePage === pg
                      ? "bg-gradient-to-br from-primary to-indigo-700 text-white shadow-sm"
                      : "border border-border text-muted-foreground hover:border-ring/50 hover:bg-muted"
                  }`}
                >
                  {pg}
                </button>
              )
            )}

            <Button
              size="sm" variant="outline"
              disabled={r.safePage === r.totalPages}
              onClick={() => r.setPage((p) => Math.min(r.totalPages, p + 1))}
              className="h-8 rounded-xl px-3 text-xs font-bold gap-1 disabled:opacity-40"
            >
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}
      <ViewDetailDialog
        review={r.viewReview}
        open={r.viewReview !== null}
        onClose={() => r.setViewReview(null)}
      />
      <DeleteConfirmDialog
        open={r.deletingId !== null}
        loading={r.actionLoading}
        onClose={() => r.setDeletingId(null)}
        onConfirm={r.handleDelete}
      />
    </div>
  );
}
