"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Star, MessageSquare } from "lucide-react";

export function ReviewModerationTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (e: React.FormEvent, reviewId: string) => {
    e.preventDefault();
    const text = replyText[reviewId];
    if (!text || !text.trim()) return;

    try {
      await axios.post(`/api/admin/support/reviews/${reviewId}/reply`, { reply: text });
      toast.success("Moderation reply added successfully");
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
      fetchReviews();
    } catch {
      toast.error("Failed to submit reply");
    }
  };

  if (loading) return <div className="text-slate-400 text-sm font-semibold p-6 text-center">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">No customer reviews found.</div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{review.customer?.user?.fullName || "Anonymous Customer"}</h4>
                <span className="text-slate-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(review.rating) ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{review.review}</p>

            {/* Existing replies */}
            {review.replies?.map((reply: any) => (
              <div key={reply.id} className="ml-8 p-4 bg-blue-50/40 rounded-xl border border-blue-500/10 space-y-1">
                <span className="text-xs font-bold text-blue-900 block">LAVO Operations Team</span>
                <p className="text-xs text-slate-600 leading-relaxed">{reply.reply}</p>
              </div>
            ))}

            {/* Reply Form */}
            <form onSubmit={(e) => handleReplySubmit(e, review.id)} className="flex gap-2">
              <input
                type="text"
                placeholder="Write operational reply..."
                value={replyText[review.id] || ""}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"><MessageSquare size={12} /> Reply</button>
            </form>
          </div>
        ))
      )}
    </div>
  );
}
