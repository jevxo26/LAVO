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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Radio size={14} className="text-indigo-300 animate-pulse" />
              <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                Real-Time Order Tracking &amp; Live Telemetry
              </span>
              {liveConnected && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Socket Connected
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Track Your Garments
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium max-w-xl">
              Follow every stage of your laundry — from express pickup to washing batches and doorstep delivery.
            </p>
          </div>

          {orderDetails && !isCancelled && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[100px] shadow-inner">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Order No</p>
                <p className="text-white font-black text-lg leading-tight mt-0.5">{orderDetails.orderNumber}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Progress</p>
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
              className="w-full h-11 pl-10 pr-4 rounded-2xl border-0 bg-white/95 text-xs font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shrink-0 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Track Order
            </Button>

            {activeOrders.length > 0 && (
              <div className="relative shrink-0">
                <select
                  onChange={(e) => onQuickSelect(e.target.value)}
                  value={orderDetails?.id || ""}
                  className="h-11 pl-3.5 pr-8 rounded-2xl border border-white/20 bg-white/15 text-white text-xs font-extrabold backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer appearance-none"
                >
                  <option value="" disabled className="text-slate-800 bg-white">Select Order...</option>
                  {activeOrders.map((o) => (
                    <option key={o.id} value={o.id} className="text-slate-800 bg-white">
                      {o.orderNumber}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-200" />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
