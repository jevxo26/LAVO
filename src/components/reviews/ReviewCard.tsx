"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays, TrendingUp, ExternalLink, Eye,
  PenLine, MoreVertical, Star, Hash, Shirt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating }        from "./StarRating";
import { StatusBadge, TypeBadge } from "./Badges";
import { OrderReview, fmtDate, gradientFor, serviceType } from "./types";

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function ServiceThumbnail({ name }: { name: string }) {
  return (
    <div className={`h-full w-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center`}>
      <Shirt size={28} className="text-white/60" />
    </div>
  );
}

// ─── MetaChip ─────────────────────────────────────────────────────────────────

function MetaChip({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] text-slate-400 leading-none">{label}</p>
        <p className="text-[12px] font-semibold text-slate-700 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Dot-menu ─────────────────────────────────────────────────────────────────

function CardMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreVertical size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[148px] rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
          {children}
        </div>
      )}
    </div>
  );
}

function CardMenuLink({ href, icon: Icon, children }: {
  href: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
    >
      <Icon size={12} className="shrink-0" />{children}
    </Link>
  );
}

function CardMenuButton({ onClick, icon: Icon, children, highlight = false }: {
  onClick: () => void; icon: React.ElementType; children: React.ReactNode; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50
        ${highlight ? "text-violet-600" : "text-slate-600 hover:text-slate-900"}`}
    >
      <Icon size={12} className="shrink-0" />{children}
    </button>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  item: OrderReview;
  onWrite: (item: OrderReview) => void;
  onView:  (item: OrderReview) => void;
}

export function ReviewCard({ item, onWrite, onView }: ReviewCardProps) {
  const has  = !!item.review;
  const type = serviceType(item.serviceName);

  return (
    <div className={`flex overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md
      ${has ? "border-slate-100 hover:border-amber-100" : "border-slate-100 hover:border-violet-100"}`}>

      {/* Thumbnail */}
      <div className="relative w-[120px] shrink-0 md:w-[140px]">
        <ServiceThumbnail name={item.serviceName} />
        {/* Reviewed badge overlay */}
        {has && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5">
            <Star size={9} className="fill-amber-300 text-amber-300" />
            <span className="text-white text-[10px] font-bold">{item.review!.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 px-5 py-4 min-w-0">

        {/* Row 1: order ID + status | date + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] font-bold text-violet-600">
              <Hash size={11} className="text-violet-400" />
              {item.orderNumber}
            </span>
            <StatusBadge status={has ? item.review!.status : "PENDING"} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden sm:block text-[11px] text-slate-400 whitespace-nowrap">
              {has ? `Reviewed ${fmtDate(item.review!.createdAt)}` : `Completed ${fmtDate(item.orderDate)}`}
            </span>
            <CardMenu>
              <CardMenuLink href="/dashboard/my-orders" icon={ExternalLink}>View Order</CardMenuLink>
              {has  && <CardMenuButton onClick={() => onView(item)}  icon={Eye}     >View Review</CardMenuButton>}
              {!has && <CardMenuButton onClick={() => onWrite(item)} icon={PenLine} highlight>Write Review</CardMenuButton>}
            </CardMenu>
          </div>
        </div>

        {/* Row 2: service name + type badge */}
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-bold text-slate-900 leading-tight">{item.serviceName}</h3>
          <TypeBadge type={type} />
        </div>

        {/* Row 3: meta chips */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          <MetaChip icon={CalendarDays} label="Order Date" value={fmtDate(item.orderDate)} />
          <MetaChip icon={TrendingUp}   label="Amount"     value={`৳${item.grandTotal.toFixed(2)}`} />
        </div>

        {/* Row 4: review content or call-to-action */}
        {has ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2.5 space-y-1">
            <div className="flex items-center gap-2">
              <StarRating value={item.review!.rating} readonly size={14} />
              <span className="text-xs font-extrabold text-slate-800">{item.review!.rating.toFixed(1)}</span>
            </div>
            {item.review!.title && (
              <p className="text-[13px] font-bold text-slate-900">{item.review!.title}</p>
            )}
            <p className="text-[12px] leading-relaxed text-slate-500 line-clamp-2">
              {item.review!.comment}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2 flex items-center gap-2">
            <Star size={13} className="text-violet-400 shrink-0" />
            <p className="text-[12px] text-violet-600 font-medium italic">
              Share your feedback on this order.
            </p>
          </div>
        )}

        {/* Row 5: actions */}
        <div className="flex items-center justify-end mt-auto pt-1 gap-2">
          {has ? (
            <>
              <Link href="/dashboard/my-orders">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-xl border-slate-200 px-3 text-[11px] font-semibold text-slate-600 hover:border-violet-200 hover:text-violet-700 hover:bg-violet-50 gap-1.5"
                >
                  <ExternalLink size={11} /> View Order
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(item)}
                className="h-8 rounded-xl border-amber-200 px-3 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 gap-1.5"
              >
                <Eye size={11} /> View
              </Button>
              <Button
                size="sm"
                onClick={() => onView(item)}
                className="h-8 rounded-xl bg-amber-500 hover:bg-amber-600 px-3 text-[11px] font-bold text-white gap-1.5 shadow-sm shadow-amber-200"
              >
                <PenLine size={11} /> Edit
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => onWrite(item)}
              className="h-8 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 text-[11px] font-bold text-white gap-1.5 shadow-sm shadow-violet-200"
            >
              <Star size={11} className="fill-white" /> Write Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
