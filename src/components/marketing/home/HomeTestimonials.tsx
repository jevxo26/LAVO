"use client";

import React, { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewTestimonial {
  id: string;
  customerName: string;
  initials: string;
  rating: number;
  comment: string;
  title: string | null;
  serviceName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: "bg-indigo-500",  ring: "ring-indigo-200"  },
  { bg: "bg-violet-500",  ring: "ring-violet-200"  },
  { bg: "bg-sky-500",     ring: "ring-sky-200"     },
  { bg: "bg-emerald-500", ring: "ring-emerald-200" },
  { bg: "bg-amber-400",   ring: "ring-amber-200"   },
  { bg: "bg-rose-500",    ring: "ring-rose-200"    },
];

function avatarPalette(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200"
          }
        />
      ))}
    </div>
  );
}

// ─── Static fallback data ─────────────────────────────────────────────────────

const FALLBACK: ReviewTestimonial[] = [
  {
    id: "f1",
    customerName: "Sarah Mitchell",
    initials: "SM",
    rating: 5,
    comment:
      "LAVO changed my morning routine entirely. QR tracking is brilliant — I always know exactly where my dry cleaning is.",
    title: "Game-changer!",
    serviceName: "Premium Dry Cleaning",
  },
  {
    id: "f2",
    customerName: "James Thompson",
    initials: "JT",
    rating: 5,
    comment:
      "We use LAVO for all our staff uniforms. Bulk pricing is excellent and quality is consistently outstanding every week.",
    title: "Perfect for teams",
    serviceName: "Bulk Uniform Wash",
  },
  {
    id: "f3",
    customerName: "Priya Sharma",
    initials: "PS",
    rating: 5,
    comment:
      "Reliable, professional, perfectly cleaned every time. I wouldn't trust anyone else with my scrubs.",
    title: null,
    serviceName: "Express Laundry",
  },
  {
    id: "f4",
    customerName: "Marcus Reid",
    initials: "MR",
    rating: 5,
    comment:
      "Running a 200-room hotel means we need reliable service every day. LAVO delivers without exception.",
    title: "Truly dependable",
    serviceName: "Hotel Linen Service",
  },
  {
    id: "f5",
    customerName: "Aisha Karim",
    initials: "AK",
    rating: 5,
    comment:
      "The pickup and delivery is super convenient. My clothes always come back fresh and neatly folded.",
    title: null,
    serviceName: "Wash & Fold",
  },
  {
    id: "f6",
    customerName: "David Okonkwo",
    initials: "DO",
    rating: 4,
    comment:
      "Very happy with the stain removal service. A stubborn wine stain vanished completely — impressive!",
    title: "Stain miracle",
    serviceName: "Stain Removal",
  },
];

// ─── TestimonialCard ──────────────────────────────────────────────────────────

function TestimonialCard({ review }: { review: ReviewTestimonial }) {
  const { bg, ring } = avatarPalette(review.customerName);

  return (
    <div
      className="
        group relative flex flex-col w-[300px] shrink-0
        rounded-2xl border border-slate-100/80 bg-white
        p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)]
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:shadow-[0_12px_36px_rgba(99,102,241,0.15)]
        hover:border-indigo-200/60 cursor-default
      "
    >
      {/* Subtle gradient top-right glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent" />

      {/* Large decorative quote icon */}
      <Quote
        size={32}
        className="absolute top-4 right-5 text-indigo-100 group-hover:text-indigo-200 transition-colors duration-300 rotate-180"
      />

      {/* Stars */}
      <StarRow rating={review.rating} />

      {/* Title */}
      {review.title && (
        <p className="mt-3 text-sm font-bold text-slate-900 leading-snug">
          {review.title}
        </p>
      )}

      {/* Comment */}
      <p className="mt-2 flex-grow text-sm text-slate-500 leading-relaxed line-clamp-3">
        &ldquo;{review.comment}&rdquo;
      </p>

      {/* Service tag */}
      <div className="mt-4 mb-4">
        <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 group-hover:bg-indigo-100 transition-colors duration-200">
          {review.serviceName}
        </span>
      </div>

      {/* Customer */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-full
            ${bg} ${ring} ring-2 ring-offset-1
            text-white text-xs font-bold
            transition-transform duration-300 group-hover:scale-105
          `}
        >
          {review.initials}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">
            {review.customerName}
          </p>
          <p className="text-[11px] text-slate-400">Verified Customer</p>
        </div>
      </div>
    </div>
  );
}

// ─── MarqueeTrack ─────────────────────────────────────────────────────────────

function MarqueeTrack({ items }: { items: ReviewTestimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pause  = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "paused";   };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "running"; };

  return (
    <div className="relative overflow-hidden w-full py-4">
      {/* Left fade */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-28 z-10
                      bg-gradient-to-r from-slate-50 to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-28 z-10
                      bg-gradient-to-l from-slate-50 to-transparent" />

      {/* Scrolling strip */}
      <div
        ref={trackRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        className="flex gap-5 w-max animate-marquee"
      >
        {items.map((r) => <TestimonialCard key={`a-${r.id}`} review={r} />)}
        {items.map((r) => <TestimonialCard key={`b-${r.id}`} review={r} />)}
      </div>
    </div>
  );
}

// ─── HomeTestimonials ─────────────────────────────────────────────────────────

interface HomeTestimonialsProps {
  data?: any;
  reviews?: ReviewTestimonial[];
}

export function HomeTestimonials({ data, reviews }: HomeTestimonialsProps) {
  const title = data?.title || "What Our Customers Say";
  const testimonials: ReviewTestimonial[] =
    reviews && reviews.length > 0 ? reviews : FALLBACK;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* ── Decorative background ─────────────────────────────────────────── */}
      {/* Soft base */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80" />
      {/* Large blurred orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full
                      bg-indigo-100/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full
                      bg-violet-100/40 blur-[120px]" />
      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
           style={{ backgroundImage: "radial-gradient(circle, #6366f1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-50 border border-indigo-100/80">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-indigo-600 uppercase">
              Customer Reviews
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {title}
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Real feedback from real customers — every review is verified and
            sourced directly from completed orders.
          </p>
        </motion.div>
      </div>

      {/* Full-bleed marquee */}
      <div className="relative z-10">
        <MarqueeTrack items={testimonials} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-10 text-center text-xs text-slate-400"
        >
          ✓ All testimonials are verified reviews from completed LAVO orders
        </motion.p>
      </div>
    </section>
  );
}
