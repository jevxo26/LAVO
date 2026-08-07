"use client";

import React, { useState, useEffect } from "react";
import { toast }   from "sonner";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";
import { Button }    from "@/components/ui/button";
import { authFetch } from "@/lib/api";
import { motion }    from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < Math.round(rating) ? "fill-warning text-warning" : "fill-muted text-border"}
        />
      ))}
      <span className="ml-1.5 text-[11px] font-black text-card-foreground tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Sk className="h-4 w-36" />
              <Sk className="h-3 w-24" />
            </div>
            <Sk className="h-4 w-24 rounded-full" />
          </div>
          <Sk className="h-14 w-full rounded-xl" />
          <Sk className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewModerationTab() {
  const [reviews,   setReviews]   = useState<any[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [loading,   setLoading]   = useState(true);

  const fetchReviews = () => {
    setLoading(true);
    authFetch("/admin/support/reviews")
      .then((r) => r.json())
      .then((res) => setReviews(res.data || []))
      .catch(() => toast.error("Failed to load customer reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleReply = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    const text = replyText[reviewId]?.trim();
    if (!text) return;
    setSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const res  = await authFetch(`/admin/support/reviews/${reviewId}/reply`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reply: text }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply added successfully");
        setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to submit reply");
      }
    } catch {
      toast.error("Failed to submit reply");
    } finally {
      setSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) return <ReviewsSkeleton />;

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
          <Star size={24} className="text-warning" />
        </div>
        <p className="text-sm font-black text-card-foreground">No reviews to moderate</p>
        <p className="mt-1 text-xs text-muted-foreground">Customer reviews will appear here.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {reviews.map((review, idx) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04, duration: 0.25 }}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                bg-gradient-to-br from-primary to-indigo-700 text-[12px] font-black text-white shadow-sm">
                {(review.customer?.user?.fullName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <p className="text-[13px] font-black text-card-foreground">
                  {review.customer?.user?.fullName || "Anonymous Customer"}
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <StarDisplay rating={review.rating} />
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Review text */}
            <p className="rounded-xl border border-border bg-muted/50 px-4 py-3
              text-xs text-card-foreground leading-relaxed font-medium">
              {review.review}
            </p>

            {/* Existing replies */}
            {review.replies?.length > 0 && (
              <div className="space-y-2.5">
                {review.replies.map((reply: any) => (
                  <div
                    key={reply.id}
                    className="ml-5 rounded-xl border border-primary/20 bg-primary/5
                      dark:border-primary/25 dark:bg-primary/10 px-4 py-3 space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full
                        bg-gradient-to-br from-primary to-indigo-700">
                        <MessageSquare size={10} className="text-white" />
                      </div>
                      <span className="text-[11px] font-black text-primary">
                        LAVO Operations Team
                      </span>
                    </div>
                    <p className="text-xs text-card-foreground leading-relaxed font-medium">
                      {reply.reply}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply form */}
            <form
              onSubmit={(e) => handleReply(e, review.id)}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Write a moderation reply…"
                value={replyText[review.id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                }
                className="flex-1 h-9 rounded-xl border border-border bg-muted px-3
                  text-xs font-medium text-card-foreground placeholder:text-muted-foreground/60
                  focus:outline-none focus:ring-2 focus:ring-ring/50 focus:bg-card transition"
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting[review.id]}
                className="h-9 rounded-xl text-xs font-black px-3 gap-1.5 shrink-0
                  bg-gradient-to-br from-primary to-indigo-700 text-primary-foreground
                  hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                {submitting[review.id]
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Send size={12} />}
                Reply
              </Button>
            </form>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
