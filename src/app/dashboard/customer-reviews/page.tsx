"use client";

import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/components/admin-reviews/useReviews";
import {
  SummaryCards,
  AnalyticsAndFilters,
  ReviewsTable,
  ViewDetailDialog,
  DeleteConfirmDialog,
} from "@/components/admin-reviews/ReviewsUI";

export default function CustomerReviewsPage() {
  const r = useReviews();

  return (
    <div className="space-y-7">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Customer Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, moderate, and manage all customer reviews across the platform.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
          <Star size={20} className="fill-amber-400" />
        </div>
      </div>

      {/* Summary cards */}
      <SummaryCards
        total={r.total} avg={r.avg}
        published={r.published} hidden={r.hidden}
        loading={r.loading}
      />

      {/* Analytics + Filters */}
      {!r.loading && !r.error && r.total > 0 && (
        <AnalyticsAndFilters
          avg={r.avg} total={r.total} dist={r.dist}
          filtered={r.filtered}
          search={r.search}           onSearch={r.setSearch}
          filterRating={r.filterRating} onRating={r.setFilterRating}
          filterStatus={r.filterStatus} onStatus={r.setFilterStatus}
          sort={r.sort}               onSort={r.setSort}
          hasFilters={r.hasFilters}   onClear={r.clearFilters}
        />
      )}

      {/* Table */}
      <ReviewsTable
        displayed={r.displayed}
        loading={r.loading} error={r.error}
        hasFilters={r.hasFilters} filteredCount={r.filtered}
        actionLoading={r.actionLoading}
        onLoad={r.load} onClear={r.clearFilters}
        onView={r.setViewReview}
        onToggle={r.handleToggleStatus}
        onDelete={r.setDeletingId}
      />

      {/* Pagination */}
      {!r.loading && !r.error && r.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {r.safePage} of {r.totalPages} &middot; {r.filtered} reviews
          </p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={r.safePage === 1}
              onClick={() => r.setPage((p) => Math.max(1, p - 1))}
              className="h-8 rounded-xl border-slate-200 px-3 text-xs font-bold gap-1 disabled:opacity-40">
              <ChevronLeft size={13} /> Previous
            </Button>
            {r.buildPages(r.safePage, r.totalPages).map((pg, idx) =>
              pg === "…" ? (
                <span key={`e-${idx}`} className="px-1 text-slate-400 text-xs">…</span>
              ) : (
                <button key={pg} onClick={() => r.setPage(pg as number)}
                  className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                    r.safePage === pg
                      ? "bg-violet-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                  }`}>
                  {pg}
                </button>
              )
            )}
            <Button size="sm" variant="outline" disabled={r.safePage === r.totalPages}
              onClick={() => r.setPage((p) => Math.min(r.totalPages, p + 1))}
              className="h-8 rounded-xl border-slate-200 px-3 text-xs font-bold gap-1 disabled:opacity-40">
              Next <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
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
