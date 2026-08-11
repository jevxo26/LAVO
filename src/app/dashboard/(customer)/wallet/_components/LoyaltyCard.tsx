"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
      style={{
        background: [
          "radial-gradient(ellipse 80% 80% at 90% 20%, color-mix(in srgb, var(--secondary) 55%, transparent) 0%, transparent 60%)",
          "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 80%, black 20%) 0%, color-mix(in srgb, var(--secondary) 55%, var(--primary) 45%) 100%)",
        ].join(", "),
        border: "1px solid color-mix(in srgb, white 18%, transparent)",
        boxShadow: "0 20px 48px -12px color-mix(in srgb, var(--secondary) 40%, transparent)",
      }}
    >
      {/* Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full blur-3xl opacity-[0.40]"
          style={{ background: "color-mix(in srgb, var(--secondary) 55%, white 45%)" }} />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full blur-3xl opacity-[0.30]"
          style={{ background: "color-mix(in srgb, var(--primary) 55%, white 45%)" }} />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/70">
              Loyalty Rewards Tier
            </p>
            <p className="mt-2 text-4xl font-black tracking-tight leading-none text-white">
              {points.toLocaleString()}{" "}
              <span className="text-2xl font-black text-white/60">PTS</span>
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md">
            <Sparkles size={24} className="text-white" />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-white/65 leading-relaxed">
            Earn 1 point for every ৳100 spent on laundry. Convert points into free order vouchers!
          </p>
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black"
            style={{
              background: "color-mix(in srgb, var(--warning) 20%, transparent)",
              border: "1px solid color-mix(in srgb, var(--warning) 35%, transparent)",
              color: "color-mix(in srgb, var(--warning-foreground) 80%, var(--warning) 20%)",
            }}
          >
            ⭐ VIP Gold Member
          </span>
        </div>
      </div>
    </motion.div>
  );
}
