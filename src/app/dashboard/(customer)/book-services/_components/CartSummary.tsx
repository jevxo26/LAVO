"use client";

import React, { useState } from "react";
import {
  Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet,
  Sparkles, Loader2, ShieldCheck, AlertCircle, ArrowUpRight,
  Calendar, MapPin, ArrowRight, Check, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, PaymentMethod } from "../_types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CartSummaryProps {
  cart: CartItem[];
  walletBalance: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  submitting: boolean;
  onUpdateQuantity: (serviceId: string, change: number) => void;
  onRemove: (serviceId: string) => void;
  onToggleAddon: (serviceId: string, addonId: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  children?: React.ReactNode;
}

export function CartSummary({
  cart,
  walletBalance,
  paymentMethod,
  subtotal,
  deliveryCharge,
  tax,
  grandTotal,
  submitting,
  onUpdateQuantity,
  onRemove,
  onToggleAddon,
  onPaymentMethodChange,
  children,
}: CartSummaryProps) {
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);

  const isWalletInsufficient = paymentMethod === "WALLET" && walletBalance < grandTotal && grandTotal > 0;
  const freeDeliveryThreshold = 300;
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 flex items-center justify-between text-white border-b border-indigo-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
              Checkout Panel
            </span>
          </div>
          <h2 className="text-white font-black text-base tracking-tight">Your Laundry Bag</h2>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-3.5 py-1.5 flex items-center gap-2 border border-white/15">
          <ShoppingBag size={14} className="text-indigo-200" />
          <span className="text-white text-xs font-black">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Free Delivery Bar */}
      <div className="bg-indigo-50/60 dark:bg-indigo-950/40 px-6 py-3 border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
          <span>
            {subtotal >= freeDeliveryThreshold
              ? "🎉 You qualify for FREE Express Delivery!"
              : `Add ৳${(freeDeliveryThreshold - subtotal).toFixed(2)} more for FREE Delivery`}
          </span>
          <span>{Math.round(freeDeliveryProgress)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full bg-indigo-200/60 dark:bg-indigo-900/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── EMPTY CART STATE ─────────────────────────────────────────────── */}
        {cart.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-3xl flex items-center justify-center mx-auto text-indigo-500">
              <ShoppingBag size={28} />
            </div>
            <div>
              <p className="text-slate-900 dark:text-white text-sm font-black">Your laundry bag is empty</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
                Tap '+ Add' on any garment from the services menu on the left to start building your booking.
              </p>
            </div>
          </div>
        ) : (
          /* ── ACTIVE CHECKOUT FLOW ──────────────────────────────────────────── */
          <div className="space-y-6">

            {/* Step Tabs Header */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  checkoutStep === 1
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] dark:bg-indigo-950 dark:text-indigo-300">
                  1
                </span>
                Items &amp; Schedule
              </button>

              <button
                type="button"
                onClick={() => setCheckoutStep(2)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                  checkoutStep === 2
                    ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] dark:bg-indigo-950 dark:text-indigo-300">
                  2
                </span>
                Payment &amp; Confirm
              </button>
            </div>

            {/* ── STEP 1: ITEMS & SCHEDULE ─────────────────────────────────────── */}
            {checkoutStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Cart Item Cards */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.service.id} className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{item.service.serviceName}</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                            ৳{item.service.basePrice.toFixed(2)} / item
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.service.id, -1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-900 dark:text-white min-w-[22px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.service.id, 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(item.service.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all dark:hover:bg-rose-950/40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {item.service.addons.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Garment Care Treatments</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.service.addons.map((addon) => {
                              const isChecked = item.selectedAddons.includes(addon.id);
                              return (
                                <button
                                  key={addon.id}
                                  type="button"
                                  onClick={() => onToggleAddon(item.service.id, addon.id)}
                                  className={`text-[11px] px-3 py-1 rounded-xl border font-bold transition-all ${
                                    isChecked
                                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {addon.addonName}{" "}
                                  <span className="opacity-80 font-black">+৳{addon.price}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* PickupForm injected */}
                {children}

                {/* Next Button */}
                <Button
                  type="button"
                  onClick={() => setCheckoutStep(2)}
                  className="w-full h-11 rounded-2xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.01]"
                >
                  Proceed to Payment Selection <ArrowRight size={15} />
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2: PAYMENT & CONFIRM ────────────────────────────────────── */}
            {checkoutStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Payment Option Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <CreditCard size={13} /> Select Payment Method
                    </h3>
                    <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={11} /> 256-Bit SSL Encrypted
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* SSLCommerz Online */}
                    <button
                      type="button"
                      onClick={() => onPaymentMethodChange("ONLINE")}
                      className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        paymentMethod === "ONLINE"
                          ? "bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border-indigo-600 text-indigo-900 shadow-md dark:bg-slate-800 dark:border-indigo-500 dark:text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                          <CreditCard size={18} />
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          paymentMethod === "ONLINE"
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          Cards / MFS
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-black text-slate-900 dark:text-white">SSLCommerz Online</p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          bKash, Nagad, Rocket, Cards
                        </p>
                      </div>
                    </button>

                    {/* LAVO Wallet */}
                    <button
                      type="button"
                      onClick={() => onPaymentMethodChange("WALLET")}
                      className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        paymentMethod === "WALLET"
                          ? "bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 border-indigo-600 text-indigo-900 shadow-md dark:bg-slate-800 dark:border-indigo-500 dark:text-white"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm">
                          <Wallet size={18} />
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          paymentMethod === "WALLET"
                            ? "bg-purple-600 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          ৳{walletBalance.toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-black text-slate-900 dark:text-white">LAVO Pay Wallet</p>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          Instant 1-tap checkout
                        </p>
                      </div>
                    </button>
                  </div>

                  {isWalletInsufficient && (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
                      <div className="flex items-center gap-2.5">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        <p className="text-xs font-extrabold">
                          Insufficient Balance (Short ৳{(grandTotal - walletBalance).toFixed(2)})
                        </p>
                      </div>
                      <Link href="/dashboard/wallet" target="_blank" className="text-xs font-black text-indigo-600 underline flex items-center gap-1">
                        Top Up <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4.5 space-y-2.5 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Items Subtotal ({cart.length} items)</span>
                    <span className="font-black text-slate-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>Express Delivery Charge</span>
                    <span className={`font-black ${deliveryCharge === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                      {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>VAT / Service Tax (5%)</span>
                    <span className="font-black text-slate-900 dark:text-white">৳{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-black text-slate-900 dark:text-white">Grand Total</span>
                    <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">৳{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit & Back Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCheckoutStep(1)}
                    className="h-12 px-4 rounded-2xl border-slate-200 font-extrabold text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || isWalletInsufficient}
                    className="flex-1 h-12 rounded-2xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles size={16} />
                        Confirm &amp; Place Order
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
