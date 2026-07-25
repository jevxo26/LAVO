"use client";

import React from "react";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, Wallet, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, PaymentMethod } from "../_types";

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
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">Booking Summary</h2>
          <p className="text-slate-400 text-xs mt-0.5">Configure items &amp; schedule</p>
        </div>
        <div className="bg-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
          <ShoppingBag size={13} className="text-slate-300" />
          <span className="text-white text-xs font-bold">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cart Items */}
        {cart.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShoppingBag size={22} className="text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No items selected</p>
            <p className="text-slate-300 text-xs mt-1">Pick services from the left</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.service.id} className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-100 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.service.serviceName}</h4>
                    <p className="text-xs text-indigo-500 font-semibold mt-0.5">
                      ৳{item.service.basePrice.toFixed(2)} / piece
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.service.id, -1)}
                        className="px-2 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="px-2.5 text-xs font-extrabold text-slate-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.service.id, 1)}
                        className="px-2 py-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.service.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {item.service.addons.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Add-ons</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.service.addons.map((addon) => {
                        const isChecked = item.selectedAddons.includes(addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => onToggleAddon(item.service.id, addon.id)}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                              isChecked
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                            }`}
                          >
                            {addon.addonName}{" "}
                            <span className="opacity-70">+৳{addon.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PickupForm injected here */}
        {children}

        {/* Payment Method */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {(["ONLINE", "WALLET"] as PaymentMethod[]).map((method) => {
              const isOnline = method === "ONLINE";
              const isActive = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => onPaymentMethodChange(method)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 font-bold transition-all gap-2 ${
                    isActive
                      ? "bg-indigo-50 border-indigo-500 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {isOnline ? <CreditCard size={20} /> : <Wallet size={20} />}
                  <span className="text-[11px]">{isOnline ? "SSLCommerz" : "Wallet"}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {isOnline ? "Online" : `৳${walletBalance.toFixed(2)}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        {cart.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-700">৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Delivery Charge</span>
              <span className={`font-semibold ${deliveryCharge === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>VAT / Tax (5%)</span>
              <span className="font-semibold text-slate-700">৳{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200">
              <span className="text-sm font-extrabold text-slate-900">Grand Total</span>
              <span className="text-lg font-extrabold text-indigo-600">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting || cart.length === 0}
          className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Placing Order...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles size={15} />
              Place &amp; Confirm Order
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
