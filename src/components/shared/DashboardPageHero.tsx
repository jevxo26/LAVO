"use client";

import React from "react";
import { Sparkles, type LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroChip {
  label: string;
  value: string | number;
  sub?:  string;
}

interface DashboardPageHeroProps {
  badge:       string;
  title:       string;
  description: string;
  icon?:       LucideIcon;
  chips?:      HeroChip[];
  liveLabel?:  string; // e.g. "Live Data" | "Processing" | "Socket Active"
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPageHero({
  badge,
  title,
  description,
  icon: Icon,
  chips = [],
  liveLabel,
}: DashboardPageHeroProps) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7 md:p-8 text-white"
      style={{
        background: [
          "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 90% at 90% 20%, color-mix(in srgb, var(--secondary) 45%, transparent) 0%, transparent 55%)",
          "radial-gradient(ellipse 50% 60% at 60% 90%, color-mix(in srgb, var(--primary) 30%, transparent) 0%, transparent 50%)",
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
        ].join(", "),
        border: "1px solid color-mix(in srgb, white 18%, transparent)",
        boxShadow: [
          "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent)",
          "inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
        ].join(", "),
      }}
    >
      {/* ── Abstract decorative layer ──────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large soft glow — top right */}
        <div className="absolute -top-24 -right-24 h-[26rem] w-[26rem] rounded-full blur-[80px] opacity-[0.50]"
          style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
        {/* Secondary glow — bottom left */}
        <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full blur-[70px] opacity-[0.40]"
          style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
        {/* Center floating glow */}
        <div className="absolute top-1/2 left-[42%] h-40 w-40 -translate-y-1/2 rounded-full blur-[50px] opacity-[0.22]"
          style={{ background: "white" }} />
        {/* Abstract ring */}
        <div className="absolute -top-8 -right-8 h-60 w-60 rounded-full opacity-[0.10]"
          style={{ border: "1.5px solid white", background: "transparent" }} />
        {/* Diagonal texture */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)" }} />
        {/* Top shimmer */}
        <div className="absolute inset-x-0 top-0 h-px opacity-[0.30]"
          style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">

        {/* Left — text block */}
        <div className="space-y-3 max-w-2xl">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Role / module badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md"
              style={{
                background: "color-mix(in srgb, var(--primary) 22%, transparent)",
                border:     "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
                color:      "color-mix(in srgb, var(--primary-foreground) 85%, var(--primary) 15%)",
              }}
            >
              {Icon
                ? <Icon size={12} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
                : <Sparkles size={12} style={{ color: "color-mix(in srgb, var(--primary-foreground) 65%, var(--primary))" }} />
              }
              {badge}
            </span>

            {/* Live indicator */}
            {liveLabel && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-md"
                style={{
                  background: "color-mix(in srgb, var(--success) 20%, transparent)",
                  border:     "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                  color:      "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                }}
              >
                <span className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "var(--success)" }} />
                {liveLabel}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-sm">
            {title}
          </h1>

          {/* Description */}
          <p className="text-white/65 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
            {description}
          </p>
        </div>

        {/* Right — telemetry chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            {chips.map((chip) => (
              <div
                key={chip.label}
                className="flex-1 sm:flex-initial rounded-2xl p-4 text-center min-w-[110px] backdrop-blur-xl"
                style={{
                  background:  "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border:      "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                  boxShadow:   "inset 0 1px 0 color-mix(in srgb, var(--primary-foreground) 8%, transparent)",
                }}
              >
                <p
                  className="text-[10px] font-black uppercase tracking-wider leading-none"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}
                >
                  {chip.label}
                </p>
                <p className="text-white font-black text-2xl mt-1 tabular-nums leading-none">
                  {chip.value}
                </p>
                {chip.sub && (
                  <p className="text-white/50 text-[10px] font-medium mt-1">{chip.sub}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
