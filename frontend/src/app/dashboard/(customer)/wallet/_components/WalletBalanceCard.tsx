"use client";

import React from "react";
import { Wallet, TrendingUp, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WalletBalanceCardProps {
  balance: number;
  onTopUp: () => void;
}

export function WalletBalanceCard({ balance, onTopUp }: WalletBalanceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
      style={{
        background: [
          "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
        ].join(", "),
        border: "1px solid color-mix(in srgb, white 18%, transparent)",
        boxShadow: "0 20px 48px -12px color-mix(in srgb, var(--primary) 45%, transparent)",
      }}
    >
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-[0.45]"
          style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-[0.35]"
          style={{ background: "color-mix(in srgb, var(--secondary) 60%, white 40%)" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
              LAVO Pay Wallet Balance
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
              ৳{(balance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Wallet size={24} className="text-white" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white/70 backdrop-blur-md">
              <TrendingUp size={12} /> BDT Currency
            </span>
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold"
              style={{
                background: "color-mix(in srgb, var(--success) 20%, transparent)",
                border: "1px solid color-mix(in srgb, var(--success) 38%, transparent)",
                color: "color-mix(in srgb, var(--success-foreground) 80%, var(--success) 20%)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
              Active
            </span>
          </div>

          <Button
            onClick={onTopUp}
            className="h-9 px-4 rounded-xl font-extrabold text-xs gap-1.5 transition-all hover:scale-[1.02]"
            style={{
              background: "color-mix(in srgb, var(--primary-foreground) 95%, transparent)",
              color: "var(--primary)",
            }}
          >
            <PlusCircle size={14} /> Top Up Wallet
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
