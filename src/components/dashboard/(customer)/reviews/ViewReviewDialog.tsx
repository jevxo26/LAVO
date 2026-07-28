"use client";

import { CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StarRating } from "./StarRating";
import { StatusBadge } from "./Badges";
import { OrderReview, fmtDate } from "./types";

interface ViewReviewDialogProps {
  item: OrderReview | null;
  open: boolean;
  onClose: () => void;
}

export function ViewReviewDialog({ item, open, onClose }: ViewReviewDialogProps) {
  const r = item?.review;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-900">Review Details</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            {item?.serviceName} &mdash; {item?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        {r && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating value={r.rating} readonly size={22} />
                <span className="text-lg font-extrabold text-slate-900">{r.rating.toFixed(1)}</span>
              </div>
              <StatusBadge status={r.status} />
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
              {r.title && <p className="text-sm font-bold text-slate-800">{r.title}</p>}
              <p className="text-sm leading-relaxed text-slate-700">{r.comment}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarDays size={11} /> Submitted {fmtDate(r.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> Order date: {item && fmtDate(item.orderDate)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="pt-1">
          <Button variant="outline" onClick={onClose}
            className="rounded-xl border-slate-200 text-xs font-bold w-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
