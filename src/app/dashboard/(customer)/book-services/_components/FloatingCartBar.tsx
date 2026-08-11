"use client";

import React from "react";
import { ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCartBarProps {
  totalItems: number;
  grandTotal: number;
  subtotal: number;
  onOpenCheckout: () => void;
}

export function FloatingCartBar({
  totalItems,
  grandTotal,
  subtotal,
  onOpenCheckout,
}: FloatingCartBarProps) {
  if (totalItems === 0) return null;

  const freeDeliveryThreshold = 300;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 sm:w-[450px] z-[90]"
      >
        <div
          className="rounded-3xl p-4 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
          style={{
            background: [
              "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
              "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
            ].join(", "),
            border: "1px solid color-mix(in srgb, var(--primary) 40%, transparent)",
          }}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
              style={{ background: "color-mix(in srgb, var(--primary) 70%, black)" }}>
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-xs">
                {totalItems}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider"
                style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
                {isFreeDelivery ? "🎉 FREE Express Delivery" : `Add ৳${(freeDeliveryThreshold - subtotal).toFixed(2)} for FREE Delivery`}
              </p>
              <p className="text-xl font-black text-white leading-tight">
                ৳{grandTotal.toFixed(2)}
              </p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onOpenCheckout}
            className="h-11 px-5 rounded-2xl text-white font-black text-xs shadow-lg gap-2 shrink-0 transition-all hover:scale-[1.03]"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--ring))",
              boxShadow: "0 4px 16px color-mix(in srgb, var(--primary) 40%, transparent)",
            }}
          >
            Checkout <ArrowRight size={16} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
