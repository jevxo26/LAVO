"use client";

import React from "react";
import { Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroChip {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
}

export interface HeroBadge {
  /** e.g. "VIP Gold Member" */
  label: string;
  /** optional live-pulse indicator */
  liveLabel?: string;
}

interface DashboardHeroBannerProps {
  badge: HeroBadge;
  title: string;
  subtitle: string;
  chips?: HeroChip[];
  actions?: React.ReactNode;
  /** extra content below title+subtitle row (e.g. CTA buttons) */
  extra?: React.ReactNode;
}

// ─── Decorative background layer (shared across all banners) ─────────────────

function BannerDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 -right-24 h-[28rem] w-[28rem] rounded-full blur-[80px] opacity-[0.55]"
        style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
      <div className="absolute -bottom-24 -left-12 h-80 w-80 rounded-full blur-[70px] opacity-[0.45]"
        style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
      <div className="absolute top-1/2 left-[42%] h-44 w-44 -translate-y-1/2 rounded-full blur-[50px] opacity-[0.30]"
        style={{ background: "white" }} />
      <div className="absolute -top-8 -right-8 h-64 w-64 rounded-full opacity-[0.12]"
        style={{ border: "1.5px solid color-mix(in srgb, white 90%, transparent)", background: "transparent" }} />
      <div className="absolute top-1/2 left-[38%] h-28 w-28 -translate-y-1/2 rounded-full opacity-[0.10]"
        style={{ border: "1px solid white", background: "transparent" }} />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)" }} />
      <div className="absolute inset-x-0 top-0 h-px opacity-[0.35]"
        style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardHeroBanner({
  badge,
  title,
  subtitle,
  chips = [],
  actions,
  extra,
}: DashboardHeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7 md:p-9 text-white shadow-2xl"
      style={{
        background: [
          "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 90% at 90% 20%, color-mix(in srgb, var(--secondary) 45%, transparent) 0%, transparent 55%)",
          "radial-gradient(ellipse 50% 60% at 60% 90%, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 50%)",
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
        ].join(", "),
        border: "1px solid color-mix(in srgb, white 18%, transparent)",
        boxShadow:
          "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
      }}
    >
      <BannerDecor />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* ── Left: title block ── */}
        <div className="space-y-3 max-w-2xl">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md"
              style={{
                background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                color: "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
              }}
            >
              <Sparkles size={13} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
              {badge.label}
            </span>

            {badge.liveLabel && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}
              >
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                {badge.liveLabel}
              </span>
            )}

            {/* extra slot for caller — e.g. customer code */}
            {extra && <div className="contents">{extra}</div>}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
            {title}
          </h1>

          <p className="text-white/65 text-xs md:text-sm leading-relaxed font-medium">
            {subtitle}
          </p>

          {actions && <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div>}
        </div>

        {/* ── Right: stat chips ── */}
        {chips.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[130px] backdrop-blur-xl"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}
                >
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-0.5 tabular-nums">{chip.value}</p>
                {chip.sub && <div className="mt-0.5">{chip.sub}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
