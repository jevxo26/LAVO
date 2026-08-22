"use client";

import React from "react";
import { Sparkles, Award, Shield, Star, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface LoyaltyCardProps {
  points: number;
}

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIERS = [
  {
    name:      "Bronze",
    min:       0,
    max:       499,
    next:      500,
    icon:      Award,
    emoji:     "🥉",
    gradient:  [
      "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, #b45309 45%, transparent) 0%, transparent 60%)",
      "linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)",
    ],
    glow1:     "#b45309",
    glow2:     "#d97706",
    shadow:    "rgba(180, 83, 9, 0.4)",
    barColor:  "#f59e0b",
    badge:     { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", color: "#fbbf24" },
    perks:     "Earn 1 pt per ৳100 spent",
  },
  {
    name:      "Silver",
    min:       500,
    max:       1999,
    next:      2000,
    icon:      Shield,
    emoji:     "🥈",
    gradient:  [
      "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, #6b7280 45%, transparent) 0%, transparent 60%)",
      "linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)",
    ],
    glow1:     "#9ca3af",
    glow2:     "#6b7280",
    shadow:    "rgba(107, 114, 128, 0.4)",
    barColor:  "#d1d5db",
    badge:     { bg: "rgba(209,213,219,0.15)", border: "rgba(209,213,219,0.3)", color: "#e5e7eb" },
    perks:     "Earn 1.5 pts per ৳100 + priority support",
  },
  {
    name:      "Gold",
    min:       2000,
    max:       4999,
    next:      5000,
    icon:      Star,
    emoji:     "🥇",
    gradient:  [
      "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, var(--secondary) 55%, transparent) 0%, transparent 60%)",
      "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 80%, black 20%) 0%, color-mix(in srgb, var(--secondary) 55%, var(--primary) 45%) 100%)",
    ],
    glow1:     "var(--secondary)",
    glow2:     "var(--primary)",
    shadow:    "color-mix(in srgb, var(--secondary) 40%, transparent)",
    barColor:  "var(--secondary)",
    badge:     { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", color: "#fbbf24" },
    perks:     "Earn 2 pts per ৳100 + free delivery",
  },
  {
    name:      "Platinum",
    min:       5000,
    max:       Infinity,
    next:      null,
    icon:      Crown,
    emoji:     "💎",
    gradient:  [
      "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, #7c3aed 55%, transparent) 0%, transparent 60%)",
      "linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)",
    ],
    glow1:     "#8b5cf6",
    glow2:     "#6d28d9",
    shadow:    "rgba(124, 58, 237, 0.45)",
    barColor:  "#a78bfa",
    badge:     { bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.35)", color: "#c4b5fd" },
    perks:     "Earn 3 pts per ৳100 + VIP perks & gifts",
  },
] as const;

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  const p    = points ?? 0;
  const tier = getTier(p);
  const Icon = tier.icon;

  // Progress bar calculation
  const hasNext     = tier.next !== null;
  const rangeSize   = hasNext ? tier.next - tier.min : 1;
  const rangeOffset = p - tier.min;
  const progress    = hasNext ? Math.min(100, Math.round((rangeOffset / rangeSize) * 100)) : 100;
  const remaining   = hasNext ? tier.next - p : 0;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
      style={{
        background: tier.gradient.join(", "),
        border: "1px solid color-mix(in srgb, white 18%, transparent)",
        boxShadow: `0 20px 48px -12px ${tier.shadow}`,
      }}
    >
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-[0.40]"
          style={{ background: `color-mix(in srgb, ${tier.glow1} 55%, white 45%)` }}
        />
        <div
          className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-[0.30]"
          style={{ background: `color-mix(in srgb, ${tier.glow2} 55%, white 45%)` }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        {/* Top row: points + icon */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/70">
              Loyalty Rewards
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
              {p.toLocaleString()}
              <span className="text-2xl font-black text-white/60"> PTS</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Icon size={24} className="text-white" />
          </div>
        </div>

        {/* Tier badge + perks */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black"
            style={{
              background: tier.badge.bg,
              border: `1px solid ${tier.badge.border}`,
              color: tier.badge.color,
            }}
          >
            {tier.emoji} {tier.name} Member
          </span>
          <span className="text-[10px] text-white/55 font-medium">{tier.perks}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-black">
            <span className="text-white/60">{tier.name}</span>
            {hasNext ? (
              <span className="text-white/60">
                {remaining.toLocaleString()} pts to{" "}
                <span className="text-white/90">{TIERS[TIERS.indexOf(tier) + 1]?.name ?? ""}</span>
              </span>
            ) : (
              <span className="text-white/80">Max tier reached 🎉</span>
            )}
          </div>

          {/* Track */}
          <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: tier.barColor }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-white/45 font-medium">
            <span>{tier.min.toLocaleString()}</span>
            {hasNext && <span>{tier.next!.toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
