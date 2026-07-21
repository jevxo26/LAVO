"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CalendarDays, CheckCircle2, TrendingUp, ExternalLink, Eye, PenLine, MoreVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { StatusBadge, TypeBadge } from "./Badges";
import { OrderReview, fmtDate, gradientFor, serviceType } from "./types";

// ─── ServiceImage ─────────────────────────────────────────────────────────────

function ServiceImage({ name }: { name: string }) {
  return <div className={`h-full w-full bg-gradient-to-br ${gradientFor(name)}`} />;
}

// ─── MetaChip ─────────────────────────────────────────────────────────────────

function MetaChip({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={13} className="text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] text-slate-400 leading-none">{label}</p>
        <p className="text-[12px] font-semibold text-slate-700 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── CardMenu ─────────────────────────────────────────────────────────────────

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
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 min-w-[140px] rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
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
    <Link href={href} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
      <Icon size={13} className="shrink-0" />{children}
    </Link>
  );
}

function CardMenuButton({ onClick, icon: Icon, children, highlight = false }: {
  onClick: () => void; icon: React.ElementType; children: React.ReactNode; highlight?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50 ${highlight ? "text-violet-600" : "text-slate-600 hover:text-slate-900"}`}>
      <Icon size={13} className="shrink-0" />{children}
    </button>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  item: OrderReview;
  onWrite: (item: OrderReview) => void;
  onView: (item: OrderReview) => void;
}

export function ReviewCard({ item, onWrite, onView }: ReviewCardProps) {
  const has = !!item.review;
  const type = serviceType(item.serviceName);

  return (
    <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">

      {/* Thumbnail */}
      <div className="relative w-[130px] shrink-0 md:w-[148px]">
        <ServiceImage name={item.serviceName} />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 px-5 py-4 min-w-0">

        {/* Row 1: order ID + badge | date + dot-menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-[12px] font-semibold text-violet-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
              </svg>
              {item.orderNumber}
            </span>
            <StatusBadge status={has ? item.review!.status : "PENDING"} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {has ? `Reviewed on ${fmtDate(item.review!.createdAt)}` : `Completed on ${fmtDate(item.orderDate)}`}
            </span>
            <CardMenu>
              <CardMenuLink href="/dashboard/my-orders" icon={ExternalLink}>View Order</CardMenuLink>
              {has && <CardMenuButton onClick={() => onView(item)} icon={Eye}>View Review</CardMenuButton>}
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
        <div className="flex flex-wrap gap-x-6 gap-y-1.5">
          <MetaChip icon={CalendarDays} label="Order Date" value={fmtDate(item.orderDate)} />
          <MetaChip icon={CheckCircle2} label="Completed"  value={fmtDate(item.orderDate)} />
          <MetaChip icon={TrendingUp}   label="Amount"     value={`৳${item.grandTotal.toFixed(2)}`} />
        </div>

        {/* Row 4: review content or pending text */}
        {has ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StarRating value={item.review!.rating} readonly size={16} />
              <span className="text-sm font-bold text-slate-800">{item.review!.rating.toFixed(1)}</span>
            </div>
            {item.review!.title && (
              <p className="text-[13px] font-bold text-slate-900">{item.review!.title}</p>
            )}
            <p className="text-[13px] leading-relaxed text-slate-500 line-clamp-2">
              {item.review!.comment}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-slate-400 italic">
            You haven&apos;t reviewed this order yet.
          </p>
        )}

        {/* Row 5: status badge left + action buttons right */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>{has && <StatusBadge status={item.review!.status} />}</div>
          <div className="flex items-center gap-2">
            {has ? (
              <>
                <Link href="/dashboard/my-orders">
                  <Button size="sm" variant="outline"
                    className="h-8 rounded-lg border-slate-200 px-3 text-[12px] font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 gap-1.5">
                    <ExternalLink size={12} /> View Order
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => onView(item)}
                  className="h-8 rounded-lg border-slate-200 px-3 text-[12px] font-semibold text-violet-600 hover:border-violet-300 hover:bg-violet-50 gap-1.5">
                  <Eye size={12} /> View Review
                </Button>
                <Button size="sm" onClick={() => onView(item)}
                  className="h-8 rounded-lg bg-violet-600 px-3 text-[12px] font-semibold text-white hover:bg-violet-700 gap-1.5">
                  <PenLine size={12} /> Edit Review
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => onWrite(item)}
                className="h-8 rounded-lg bg-violet-600 px-4 text-[12px] font-semibold text-white hover:bg-violet-700 gap-1.5">
                <Star size={12} className="fill-white" /> Write Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
