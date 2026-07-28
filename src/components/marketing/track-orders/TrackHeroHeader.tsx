"use client";

import React from "react";
import { Search, ChevronDown, Radio } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-7 py-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white" />
        <div className="absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-white" />
      </div>

      <div className="relative z-10 flex flex-col gap-5">
        {/* Title row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Radio size={13} className="text-indigo-200" />
              <span className="text-indigo-200 text-[11px] font-semibold uppercase tracking-widest">
                Real-time Tracking
              </span>
              {liveConnected && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Track Your Order</h1>
            <p className="mt-1 text-sm text-indigo-200">
              Follow every step of your laundry — from pickup to doorstep delivery.
            </p>
          </div>

          {orderDetails && !isCancelled && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Order</p>
                <p className="text-white font-extrabold text-lg leading-tight">{orderDetails.orderNumber}</p>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-3 text-center">
                <p className="text-indigo-200 text-[10px] font-semibold uppercase tracking-wider">Progress</p>
                <p className="text-white font-extrabold text-lg leading-tight">{pct}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Search bar */}
        <form onSubmit={onSearchSubmit} className="flex w-full max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={orderNumberInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Enter order number (e.g. ORD-12345)…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border-0 bg-white/95 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
            />
          </div>
          <Button
            type="submit"
            className="h-10 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs px-4 shrink-0 shadow-sm"
          >
            Track
          </Button>

          {activeOrders.length > 0 && (
            <div className="relative shrink-0">
              <select
                onChange={(e) => onQuickSelect(e.target.value)}
                value={orderDetails?.id || ""}
                className="h-10 pl-3 pr-8 rounded-xl border-0 bg-white/20 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer appearance-none"
              >
                <option value="" disabled className="text-slate-700 bg-white">Quick select…</option>
                {activeOrders.map((o) => (
                  <option key={o.id} value={o.id} className="text-slate-700 bg-white">
                    {o.orderNumber}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/70" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
