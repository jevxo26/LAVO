"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { OrderReview, ReviewData, RATING_LABELS } from "./types";

interface WriteReviewDialogProps {
  item: OrderReview | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (orderId: string, review: ReviewData) => void;
}

export function WriteReviewDialog({ item, open, onClose, onSuccess }: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) { setRating(0); setTitle(""); setComment(""); }
  }, [open, item?.orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    if (rating === 0) { toast.error("Please select a star rating."); return; }
    if (comment.trim().length < 5) { toast.error("Please write at least 5 characters."); return; }

    setSubmitting(true);
    try {
      const res = await authFetch(`/customer/reviews/${item.orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title: title.trim() || undefined, comment: comment.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted successfully!");
        onSuccess(item.orderId, {
          id: data.data.id,
          rating: data.data.rating,
          title: data.data.title ?? null,
          comment: data.data.review,
          status: data.data.status,
          createdAt: data.data.createdAt,
        });
        onClose();
      } else {
        toast.error(data.message || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900">Write a Review</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {item?.serviceName} &mdash; {item?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">
              Your Rating <span className="text-rose-500">*</span>
            </Label>
            <StarRating value={rating} onChange={setRating} size={28} />
            {rating > 0 && <p className="text-[11px] text-slate-400">{RATING_LABELS[rating]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wr-title" className="text-xs font-bold text-slate-700">
              Title <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input id="wr-title" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Great service, fast delivery"
              className="rounded-xl border-slate-200 text-sm focus-visible:ring-violet-400" maxLength={80} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wr-comment" className="text-xs font-bold text-slate-700">
              Comment <span className="text-rose-500">*</span>
            </Label>
            <Textarea id="wr-comment" value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this order..."
              rows={4} className="rounded-xl border-slate-200 text-sm resize-none focus-visible:ring-violet-400" maxLength={500} />
            <p className="text-right text-[10px] text-slate-400">{comment.length}/500</p>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}
              className="rounded-xl border-slate-200 text-xs font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}
              className="rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-700">
              {submitting
                ? <Loader2 size={14} className="mr-1.5 animate-spin" />
                : <Star size={13} className="mr-1.5" />}
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
