"use client";

import React from "react";
import { Search, ChevronDown, Radio, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "./types";

interface TrackHeroHeaderProps {
  liveConnected: boolean;
  orderDetails: OrderDetails | null;
  isCancelled: boolean;
  pct: number;
  orderNumberInput: string;
  activeOrders: Array<{ id: string; orderNumber: string }>;
  onInputChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onQuickSelect: (id: string) => void;
}

export function TrackHeroHeader({
  liveConnected,
  orderDetails,
  isCancelled,
  pct,
  orderNumberInput,
  activeOrders,
  onInputChange,
  onSearchSubmit,
  onQuickSelect,
}: TrackHeroHeaderProps) {
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
        boxShadow: "0 32px 64px -16px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 1px 0 color-mix(in srgb, white 20%, transparent)",
      }}
    >
      {/* decorative glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl opacity-[0.50]"
          style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-3xl opacity-[0.40]"
          style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 28px)" }} />
        <div className="absolute inset-x-0 top-0 h-px opacity-[0.30]"
          style={{ background: "linear-gradient(90deg, transparent, white 30%, white 70%, transparent)" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Radio size={14} className="animate-pulse" style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }} />
              <span className="text-xs font-black uppercase tracking-widest"
                style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
                Real-Time Order Tracking &amp; Live Telemetry
              </span>
              {liveConnected && (
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black"
                  style={{
                    background: "color-mix(in srgb, var(--success) 20%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                    color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
                  }}>
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
                  Live Updates
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Track Your Garments
            </h1>
            <p className="text-white/65 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Follow every stage of your laundry — from express pickup to washing batches and doorstep delivery.
            </p>
          </div>

          {orderDetails && !isCancelled && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl backdrop-blur-xl px-4 py-3 text-center min-w-[100px]"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                }}>
                <p className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}>
                  Order No
                </p>
                <p className="text-white font-black text-lg leading-tight mt-0.5">{orderDetails.orderNumber}</p>
              </div>
              <div className="rounded-2xl backdrop-blur-xl px-4 py-3 text-center min-w-[90px]"
                style={{
                  background: "color-mix(in srgb, var(--primary-foreground) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                }}>
                <p className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: "color-mix(in srgb, var(--primary-foreground) 60%, var(--primary))" }}>
                  Progress
                </p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{pct}%</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSearchSubmit} className="flex flex-col sm:flex-row w-full max-w-xl items-stretch sm:items-center gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              value={orderNumberInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter order number (e.g. ORD-12345)..."
              className="w-full h-11 pl-10 pr-4 rounded-2xl border-0 bg-white/95 text-xs font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 shadow-md"
              style={{ "--tw-ring-color": "color-mix(in srgb, var(--primary) 50%, transparent)" } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="h-11 px-5 rounded-2xl text-white font-black text-xs shrink-0 shadow-lg transition-all hover:scale-[1.02]"
              style={{
                background: "color-mix(in srgb, var(--primary) 80%, black)",
                boxShadow: "0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)",
              }}
            >
              Track Order
            </Button>

            {activeOrders.length > 0 && (
              <div className="relative shrink-0">
                <select
                  onChange={(e) => onQuickSelect(e.target.value)}
                  value={orderDetails?.id || ""}
                  className="h-11 pl-3.5 pr-8 rounded-2xl text-white text-xs font-extrabold backdrop-blur-md focus:outline-none cursor-pointer appearance-none"
                  style={{
                    background: "color-mix(in srgb, var(--primary-foreground) 15%, transparent)",
                    border: "1px solid color-mix(in srgb, white 20%, transparent)",
                  }}
                >
                  <option value="" disabled className="text-slate-800 bg-white">Select Order...</option>
                  {activeOrders.map((o) => (
                    <option key={o.id} value={o.id} className="text-slate-800 bg-white">
                      {o.orderNumber}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
