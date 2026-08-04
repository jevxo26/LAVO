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
import { motion } from "framer-motion";

function ServiceThumbnail({ name }: { name: string }) {
  return (
    <div className={`h-full w-full bg-gradient-to-br ${gradientFor(name)} flex items-center justify-center p-3`}>
      <Shirt size={32} className="text-white/80" />
    </div>
  );
}

function MetaChip({ icon: Icon, label, value }: {
  icon: React.ElementType; label: string; value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={12} className="text-slate-400 shrink-0" />
      <div>
        <p className="text-[10px] text-slate-400 font-medium leading-none">{label}</p>
        <p className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

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
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[148px] rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl dark:bg-slate-800 dark:border-slate-700">
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
      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
    >
      <Icon size={13} className="shrink-0" />{children}
    </Link>
  );
}

function CardMenuButton({ onClick, icon: Icon, children, highlight = false }: {
  onClick: () => void; icon: React.ElementType; children: React.ReactNode; highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3.5 py-2 text-xs font-extrabold transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
        highlight ? "text-amber-600 dark:text-amber-400" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      <Icon size={13} className="shrink-0" />{children}
    </button>
  );
}

interface ReviewCardProps {
  item: OrderReview;
  onWrite: (item: OrderReview) => void;
  onView:  (item: OrderReview) => void;
}

export function ReviewCard({ item, onWrite, onView }: ReviewCardProps) {
  const has  = !!item.review;
  const type = serviceType(item.serviceName);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`flex flex-col sm:flex-row overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-900 ${
        has ? "border-slate-200/80 hover:border-amber-300 dark:border-slate-800" : "border-slate-200/80 hover:border-indigo-300 dark:border-slate-800"
      }`}
    >
      <div className="relative w-full sm:w-[130px] md:w-[150px] shrink-0 h-24 sm:h-auto">
        <ServiceThumbnail name={item.serviceName} />
        {has && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-md px-2.5 py-0.5 border border-white/20">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            <span className="text-white text-[10px] font-black">{item.review!.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
              <Hash size={12} />
              {item.orderNumber}
            </span>
            <StatusBadge status={has ? item.review!.status : "PENDING"} />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:block text-[11px] font-medium text-slate-400">
              {has ? `Reviewed ${fmtDate(item.review!.createdAt)}` : `Completed ${fmtDate(item.orderDate)}`}
            </span>
            <CardMenu>
              <CardMenuLink href="/dashboard/my-orders" icon={ExternalLink}>View Order</CardMenuLink>
              {has  && <CardMenuButton onClick={() => onView(item)}  icon={Eye}>View Review</CardMenuButton>}
              {!has && <CardMenuButton onClick={() => onWrite(item)} icon={PenLine} highlight>Write Review</CardMenuButton>}
            </CardMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">{item.serviceName}</h3>
          <TypeBadge type={type} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-0.5">
          <MetaChip icon={CalendarDays} label="Order Date" value={fmtDate(item.orderDate)} />
          <MetaChip icon={TrendingUp}   label="Total Spent" value={`৳${item.grandTotal.toFixed(2)}`} />
        </div>

        {has ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 space-y-1 dark:bg-amber-950/30 dark:border-amber-900/60">
            <div className="flex items-center gap-2">
              <StarRating value={item.review!.rating} readonly size={14} />
              <span className="text-xs font-black text-slate-900 dark:text-white">{item.review!.rating.toFixed(1)}</span>
            </div>
            {item.review!.title && (
              <p className="text-xs font-black text-slate-900 dark:text-white">{item.review!.title}</p>
            )}
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {item.review!.comment}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3 flex items-center gap-2 dark:bg-indigo-950/30 dark:border-indigo-900/60">
            <Star size={14} className="text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-extrabold italic">
              Order completed! Tap write review to rate this service.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end mt-auto pt-2 gap-2">
          {has ? (
            <>
              <Link href="/dashboard/my-orders">
                <Button
                  variant="outline"
                  className="h-8 rounded-xl border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-50 gap-1.5 dark:border-slate-700 dark:text-slate-300"
                >
                  <ExternalLink size={12} /> View Order
                </Button>
              </Link>
              <Button
                onClick={() => onView(item)}
                className="h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-black text-white gap-1.5 shadow-sm shadow-amber-500/20"
              >
                <Eye size={12} /> View Review
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onWrite(item)}
              className="h-9 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black text-white gap-1.5 shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Star size={13} className="fill-white" /> Write Review
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
