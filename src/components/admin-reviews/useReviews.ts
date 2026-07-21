"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Review, SortKey } from "./ReviewsUI";

const PAGE_SIZE = 10;

function buildPages(cur: number, tot: number): (number | "…")[] {
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1);
  if (cur <= 3) return [1, 2, 3, "…", tot];
  if (cur >= tot - 2) return [1, "…", tot - 2, tot - 1, tot];
  return [1, "…", cur - 1, cur, cur + 1, "…", tot];
}

export function useReviews() {
  const [reviews, setReviews]         = useState<Review[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sort, setSort]               = useState<SortKey>("newest");
  const [viewReview, setViewReview]   = useState<Review | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const load = async () => {
    setLoading(true); setError(false);
    try {
      const res  = await authFetch("/support/reviews?limit=1000");
      const data = await res.json();
      if (data.success) setReviews(data.data);
      else setError(true);
    } catch {
      setError(true);
      toast.error("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, filterRating, filterStatus, sort]);

  // ── actions ────────────────────────────────────────────────────────────────
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
        toast.success(`Review ${next === "HIDDEN" ? "hidden" : "published"}.`);
        setReviews((prev) => prev.map((x) =>
          x.id === r.id ? { ...x, status: next === "PUBLISHED" ? "Published" : "Hidden" } : x
        ));
      } else toast.error(data.message || "Failed to update status.");
    } catch { toast.error("Something went wrong."); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      const res  = await authFetch(`/support/reviews/${deletingId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted.");
        setReviews((prev) => prev.filter((x) => x.id !== deletingId));
        setDeletingId(null);
      } else toast.error(data.message || "Failed to delete.");
    } catch { toast.error("Something went wrong."); }
    finally { setActionLoading(false); }
  };

  // ── derived stats ──────────────────────────────────────────────────────────
  const total     = reviews.length;
  const avg       = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const published = reviews.filter((r) => r.status.toUpperCase() === "PUBLISHED").length;
  const hidden    = reviews.filter((r) => r.status.toUpperCase() === "HIDDEN").length;
  const dist      = [5,4,3,2,1].map((s) => ({
    star: s,
    count: reviews.filter((r) => Math.round(r.rating) === s).length,
  }));

  // ── filtered & paginated ───────────────────────────────────────────────────
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
  const clearFilters = () => {
    setSearch(""); setFilterRating(0); setFilterStatus("ALL"); setSort("newest");
  };

  return {
    // data
    loading, error, load,
    total, avg, published, hidden, dist,
    filtered: filtered.length, displayed,
    // pagination
    safePage, totalPages, setPage, buildPages,
    // toolbar
    search, setSearch,
    filterRating, setFilterRating,
    filterStatus, setFilterStatus,
    sort, setSort,
    hasFilters, clearFilters,
    // dialogs
    viewReview, setViewReview,
    deletingId, setDeletingId,
    actionLoading,
    handleToggleStatus,
    handleDelete,
  };
}
