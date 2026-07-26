"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Star, Send, Loader2, Inbox, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}
        />
      ))}
      <span className="ml-1.5 text-[11px] font-bold text-slate-600">{rating.toFixed(1)}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className ?? ""}`} />;
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <Sk className="h-4 w-36" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-4 w-24" />
          </div>
          <Sk className="h-16 w-full rounded-xl" />
          <Sk className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewModerationTab() {
  const [reviews, setReviews]       = useState<any[]>([]);
  const [replyText, setReplyText]   = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [loading, setLoading]       = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("/api/admin/support/reviews");
      setReviews(res.data.data || []);
    } catch {
      toast.error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReply = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    const text = replyText[reviewId]?.trim();
    if (!text) return;

    setSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await axios.post(`/api/admin/support/reviews/${reviewId}/reply`, { reply: text });
      toast.success("Reply added successfully");
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReviews();
    } catch {
      toast.error("Failed to submit reply");
    } finally {
      setSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) return <ReviewsSkeleton />;

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <Star size={24} className="text-amber-400" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No reviews to moderate</p>
        <p className="mt-1 text-xs text-slate-400">Customer reviews will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div className="space-y-1">
              <p className="text-[13px] font-bold text-slate-900">
                {review.customer?.user?.fullName || "Anonymous Customer"}
              </p>
              <p className="text-[11px] text-slate-400">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
            </div>
            <StarDisplay rating={review.rating} />
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Review text */}
            <p className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-xs text-slate-600 leading-relaxed">
              {review.review}
            </p>

            {/* Existing replies */}
            {review.replies?.length > 0 && (
              <div className="space-y-2.5">
                {review.replies.map((reply: any) => (
                  <div
                    key={reply.id}
                    className="ml-5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 space-y-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
                        <MessageSquare size={10} className="text-white" />
                      </div>
                      <span className="text-[11px] font-bold text-indigo-700">LAVO Operations Team</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{reply.reply}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <form onSubmit={(e) => handleReply(e, review.id)} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a moderation reply…"
                value={replyText[review.id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                }
                className="flex-1 h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting[review.id]}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 gap-1.5 shrink-0"
              >
                {submitting[review.id]
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Send size={12} />}
                Reply
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
