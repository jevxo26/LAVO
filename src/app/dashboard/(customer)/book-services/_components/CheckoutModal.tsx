"use client";

import React, { useState } from "react";
import {
  Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet,
  Sparkles, Loader2, ShieldCheck, AlertCircle, ArrowUpRight,
  ArrowRight, X, Calendar, MapPin, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CartItem, PaymentMethod } from "../_types";
import Link from "next/link";
import { motion } from "framer-motion";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
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

export function CheckoutModal({
  open,
  onOpenChange,
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
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const isWalletInsufficient = paymentMethod === "WALLET" && walletBalance < grandTotal && grandTotal > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="px-7 py-6 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                Express Checkout
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">Configure Laundry Booking</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white/10 backdrop-blur-md rounded-2xl px-3.5 py-1.5 text-xs font-black border border-white/15">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Step Tabs Header */}
        <div className="px-7 pt-5">
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                step === 1
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] dark:bg-indigo-950 dark:text-indigo-300 font-black">
                1
              </span>
              Garments &amp; Schedule
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                step === 2
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] dark:bg-indigo-950 dark:text-indigo-300 font-black">
                2
              </span>
              Payment &amp; Confirm
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Selected Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShoppingBag size={13} /> Selected Garments
                </h3>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.service.id} className="bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">{item.service.serviceName}</h4>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-extrabold mt-0.5">
                            ৳{item.service.basePrice.toFixed(2)} / piece
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
              </div>

              {/* Injected Pickup Form */}
              {children}

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-12 rounded-2xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.01]"
              >
                Proceed to Payment Selection <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
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
                        bKash, Nagad, Rocket, Visa &amp; Mastercard
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
                  <span>Items Subtotal</span>
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

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-12 px-5 rounded-2xl border-slate-200 font-black text-xs text-slate-600"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || isWalletInsufficient}
                  className="flex-1 h-12 rounded-2xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 gap-2 transition-all hover:scale-[1.01]"
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
      </DialogContent>
    </Dialog>
  );
}
