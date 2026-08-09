"use client";

import React from "react";
import {
  Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet,
  Sparkles, Loader2, ShieldCheck, AlertCircle, ArrowUpRight,
  CheckCircle2, Shirt, Info, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, PaymentMethod } from "../_types";
import Link from "next/link";
import { motion } from "framer-motion";

const GARMENT_PRESETS = [
  { type: "Shirt" },
  { type: "T-Shirt" },
  { type: "Pants" },
  { type: "Jeans" },
  { type: "Suit Jacket" },
  { type: "Suit Trouser" },
  { type: "Saree" },
  { type: "Kurta" },
  { type: "Dress" },
  { type: "Sweater" },
  { type: "Jacket" },
  { type: "Bed Sheet" },
];

interface CartSummaryProps {
  cart: CartItem[];
  walletBalance: number;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  submitting: boolean;
  autoSelectedServiceId?: string;
  onUpdateQuantity: (serviceId: string, change: number) => void;
  onUpdateGarmentQty: (serviceId: string, garmentType: string, change: number) => void;
  onRemove: (serviceId: string) => void;
  onToggleAddon: (serviceId: string, addonId: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onViewDetails: (serviceId: string) => void;
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
  autoSelectedServiceId,
  onUpdateQuantity,
  onUpdateGarmentQty,
  onRemove,
  onToggleAddon,
  onPaymentMethodChange,
  onViewDetails,
  children,
}: CartSummaryProps) {
  const isWalletInsufficient = paymentMethod === "WALLET" && walletBalance < grandTotal && grandTotal > 0;
  const freeDeliveryThreshold = 300;
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800 space-y-0">
      {/* ── 1. Header ────────────────────────────────────────────────────────── */}
      <div className="px-7 py-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-between text-white border-b border-blue-800/40">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
              Checkout &amp; Booking Studio
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mt-0.5">Booking Summary</h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2 border border-white/15">
          <ShoppingBag size={15} className="text-cyan-200" />
          <span className="text-white text-xs font-black">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── 2. Free Express Delivery Bar ─────────────────────────────────────── */}
      <div className="bg-blue-50/70 dark:bg-blue-950/50 px-7 py-3.5 border-b border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center justify-between text-xs font-extrabold text-blue-900 dark:text-blue-200">
          <span>
            {subtotal >= freeDeliveryThreshold
              ? "🎉 You qualify for FREE Express Doorstep Delivery!"
              : `Add ৳${(freeDeliveryThreshold - subtotal).toFixed(2)} more for FREE Delivery`}
          </span>
          <span className="font-black">{Math.round(freeDeliveryProgress)}%</span>
        </div>
        <div className="mt-2 h-2 w-full bg-blue-200/60 dark:bg-blue-900/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      {/* ── 3. Main Card Form Body ───────────────────────────────────────────── */}
      <div className="p-7 space-y-7">
        {/* Selected Garments Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShoppingBag size={13} /> Selected Garments ({cart.length})
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/80 space-y-2">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
                <Shirt size={22} />
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Your Laundry Bag is empty</p>
              <p className="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">
                Select items from the laundry catalog on the left to start building your order.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {cart.map((item) => {
                const garmentQty = (type: string) =>
                  item.garmentBreakdown.find((g) => g.type === type)?.qty ?? 0;
                const breakdownSum = item.garmentBreakdown.reduce((s, g) => s + g.qty, 0);
                const totalGarments = breakdownSum > 0 ? breakdownSum : item.quantity;

                return (
                  <div key={item.service.id} className={`rounded-2xl border overflow-hidden ${
                      item.service.id === autoSelectedServiceId
                        ? "border-emerald-200 dark:border-emerald-800/50"
                        : "border-slate-200/60 dark:border-slate-700/60"
                    }`}>

                    {/* ── Item header ── */}
                    <div className={`p-4 ${
                      item.service.id === autoSelectedServiceId
                        ? "bg-emerald-50/70 dark:bg-emerald-950/20"
                        : "bg-slate-50/80 dark:bg-slate-800/60"
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{item.service.serviceName}</h4>
                            {item.service.id === autoSelectedServiceId && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-black text-white">✦ From Homepage</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-xs text-blue-600 dark:text-cyan-400 font-extrabold">
                              ৳{item.service.basePrice.toFixed(2)} / piece
                            </p>
                            <button
                              type="button"
                              onClick={() => onViewDetails(item.service.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors border border-blue-200 dark:border-blue-700"
                            >
                              <Info size={11} />
                              View Details &amp; Summary
                            </button>
                            {totalGarments > 0 && (
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                → {totalGarments} pcs · ৳{(item.service.basePrice * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {totalGarments === 0 && (
                            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                              <button type="button" onClick={() => onUpdateQuantity(item.service.id, -1)} className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Minus size={12} /></button>
                              <span className="px-2.5 text-xs font-black text-slate-900 dark:text-white min-w-[22px] text-center">{item.quantity}</span>
                              <button type="button" onClick={() => onUpdateQuantity(item.service.id, 1)} className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Plus size={12} /></button>
                            </div>
                          )}
                          <button type="button" onClick={() => onRemove(item.service.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all dark:hover:bg-rose-950/40">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Addon treatments */}
                      {item.service.addons.length > 0 && (
                        <div className="space-y-1.5 mt-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Care Treatments</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.service.addons.map((addon) => {
                              const isChecked = item.selectedAddons.includes(addon.id);
                              return (
                                <button key={addon.id} type="button" onClick={() => onToggleAddon(item.service.id, addon.id)}
                                  className={`text-[11px] px-3 py-1 rounded-xl border font-bold transition-all ${
                                    isChecked ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                                  }`}>
                                  {addon.addonName} <span className="opacity-80 font-black">+৳{addon.price}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Garment Picker ── */}
                    <div className="border-t border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900">
                      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-100/80 dark:bg-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <Package size={12} className="text-blue-600" />
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Select Garments</span>
                        </div>
                        {totalGarments > 0 && (
                          <span className="text-[10px] font-black text-blue-600 dark:text-cyan-400">
                            {totalGarments} piece{totalGarments !== 1 ? "s" : ""} selected
                          </span>
                        )}
                      </div>
                      <div className="px-4 py-3 grid grid-cols-2 gap-2">
                        {GARMENT_PRESETS.map(({ type }) => {
                          const qty = garmentQty(type);
                          return (
                            <div key={type} className={`flex items-center justify-between rounded-xl px-2.5 py-2 border transition-all ${
                              qty > 0
                                ? "bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-700"
                                : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
                            }`}>
                              <span className={`text-[11px] font-bold flex items-center gap-1.5 ${
                                qty > 0 ? "text-blue-700 dark:text-blue-300" : "text-slate-600 dark:text-slate-300"
                              }`}>
                                <Shirt size={12} className={qty > 0 ? "text-blue-600" : "text-slate-400"} />
                                {type}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {qty > 0 && (
                                  <>
                                    <button type="button" onClick={() => onUpdateGarmentQty(item.service.id, type, -1)}
                                      className="w-6 h-6 rounded-lg flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
                                      {qty === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                                    </button>
                                    <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-white">{qty}</span>
                                  </>
                                )}
                                <button type="button" onClick={() => onUpdateGarmentQty(item.service.id, type, 1)}
                                  className="w-6 h-6 rounded-lg flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-all">
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pickup Details & Schedule Form injected */}
        {children}

        {/* Payment Method Section */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                  ? "bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/90 border-blue-600 text-blue-900 shadow-md dark:bg-slate-800 dark:border-blue-500 dark:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <CreditCard size={18} />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  paymentMethod === "ONLINE"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  Cards / MFS
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-black text-slate-900 dark:text-white">Pay Online</p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  bKash, Nagad, Rocket, Cards
                </p>
              </div>
            </button>

            {/* LAVO Pay Wallet */}
            <button
              type="button"
              onClick={() => onPaymentMethodChange("WALLET")}
              className={`relative flex flex-col items-start justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                paymentMethod === "WALLET"
                  ? "bg-gradient-to-br from-blue-50/90 via-white to-cyan-50/90 border-blue-600 text-blue-900 shadow-md dark:bg-slate-800 dark:border-blue-500 dark:text-white"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
                  <Wallet size={18} />
                </div>
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  paymentMethod === "WALLET"
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  ৳{walletBalance.toFixed(2)}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-black text-slate-900 dark:text-white">Laundrix Wallet</p>
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
              <Link href="/dashboard/wallet" target="_blank" className="text-xs font-black text-blue-600 underline flex items-center gap-1">
                Top Up <ArrowUpRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        {cart.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 space-y-2.5 border border-slate-200/60 dark:border-slate-700/60">
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
              <span className="text-xl font-black text-blue-600 dark:text-cyan-400">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Submit Order Button */}
        <Button
          type="submit"
          disabled={submitting || cart.length === 0 || isWalletInsufficient}
          className="w-full h-12 rounded-2xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Processing Booking Request...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              Place &amp; Confirm Laundry Order
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
