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
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/40 p-4 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <ShoppingBag size={22} />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-xs">
                {totalItems}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300">
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
            className="h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-600/40 gap-2 shrink-0 transition-all hover:scale-[1.03]"
          >
            Checkout <ArrowRight size={16} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
