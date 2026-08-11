"use client";

import React, { useEffect } from "react";
import {
  X, Clock, Tag, Sparkles, CheckCircle2, ShoppingBag, ArrowRight,
  Shirt, Star, Shield, Plus, Minus, Trash2, Package, Info, FileText
} from "lucide-react";
import type { Service, CartItem } from "../_types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

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

interface ServiceDetailDrawerProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  cartItem?: CartItem;
  inCart: boolean;
  onAdd: (service: Service) => void;
  onToggleAddon: (serviceId: string, addonId: string) => void;
  onUpdateQuantity: (serviceId: string, change: number) => void;
  onUpdateGarmentQty: (serviceId: string, garmentType: string, change: number) => void;
  onRemove: (serviceId: string) => void;
}

export function ServiceDetailDrawer({
  service,
  isOpen,
  onClose,
  cartItem,
  inCart,
  onAdd,
  onToggleAddon,
  onUpdateQuantity,
  onUpdateGarmentQty,
  onRemove,
}: ServiceDetailDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const addonSubtotal = cartItem
    ? cartItem.selectedAddons.reduce((sum, addonId) => {
        const addon = service?.addons.find((a) => a.id === addonId);
        return sum + (addon ? addon.price * cartItem.quantity : 0);
      }, 0)
    : 0;

  const itemSubtotal = cartItem && service
    ? service.basePrice * cartItem.quantity
    : 0;

  const garmentQty = (type: string) =>
    cartItem?.garmentBreakdown.find((g) => g.type === type)?.qty ?? 0;

  const breakdownSum = cartItem?.garmentBreakdown.reduce((s, g) => s + g.qty, 0) ?? 0;
  const totalGarmentsSelected = breakdownSum > 0 ? breakdownSum : (cartItem?.quantity ?? 0);

  return (
    <AnimatePresence>
      {isOpen && service && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 flex flex-col"
          >
            {/* ── Header ── */}
            <div
              className="relative px-6 py-8 text-white flex-shrink-0"
              style={{
                background: [
                  "radial-gradient(ellipse 80% 80% at 10% 50%, color-mix(in srgb, var(--primary) 55%, transparent) 0%, transparent 60%)",
                  "linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, black 15%) 0%, color-mix(in srgb, var(--primary) 60%, var(--secondary) 40%) 50%, color-mix(in srgb, var(--secondary) 70%, black 30%) 100%)",
                ].join(", "),
              }}
            >
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
                  style={{ background: "color-mix(in srgb, var(--primary) 70%, white)" }} />
                <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full opacity-15 blur-3xl"
                  style={{ background: "color-mix(in srgb, var(--secondary) 70%, white)" }} />
              </div>
              <button onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white transition-all">
                <X size={18} />
              </button>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: "color-mix(in srgb, var(--primary) 40%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--primary) 50%, transparent)",
                      color: "color-mix(in srgb, var(--primary-foreground) 80%, var(--secondary))",
                    }}
                  >
                    <Shirt size={10} /> {service.category}
                  </span>
                  {inCart && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[10px] font-black text-emerald-300">
                      <CheckCircle2 size={10} /> Order Summary &amp; Details
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">{service.serviceName}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 font-extrabold"
                    style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
                    <Clock size={13} />{service.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1.5 font-extrabold"
                    style={{ color: "color-mix(in srgb, var(--secondary) 80%, white)" }}>
                    <Tag size={13} />{service.garmentType}
                  </span>
                </div>
                <div className="inline-flex items-baseline gap-1 rounded-2xl bg-white/10 border border-white/15 px-4 py-2">
                  <span className="text-2xl font-black text-white">৳{service.basePrice.toFixed(2)}</span>
                  <span className="text-xs text-white/60 font-bold">/ piece</span>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="flex-1 p-6 space-y-5 overflow-y-auto">

              {/* ── ORDER DETAILS CARD (অর্ডারের বিবরণী) ── */}
              {inCart && cartItem && (
                <div className="rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-800/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-blue-600 dark:text-cyan-400" />
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Order Summary</span>
                    </div>
                    <span className="text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                      Total: {totalGarmentsSelected} Piece{totalGarmentsSelected !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* 1. Koyta & Ki Ki Item Breakdown */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <FileText size={11} className="text-blue-500" /> Selected Items Breakdown
                    </p>

                    {cartItem.garmentBreakdown && cartItem.garmentBreakdown.length > 0 ? (
                      <div className="space-y-1.5">
                        {cartItem.garmentBreakdown.map((g) => (
                          <div key={g.type} className="flex items-center justify-between bg-white dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-blue-100 dark:border-slate-700">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Shirt size={12} className="text-blue-500" />
                              {g.type} × {g.qty}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-blue-600 dark:text-cyan-400">
                                ৳{(service.basePrice * g.qty).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1 border-l pl-2 border-slate-200 dark:border-slate-700">
                                <button
                                  type="button"
                                  onClick={() => onUpdateGarmentQty(service.id, g.type, -1)}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 transition-colors"
                                  title="Decrease / Delete"
                                >
                                  {g.qty === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateGarmentQty(service.id, g.type, 1)}
                                  className="w-5 h-5 rounded flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-blue-100 dark:border-slate-700">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {service.serviceName} × {cartItem.quantity} pcs (General Items)
                          </span>
                          <span className="text-xs font-black text-blue-600 dark:text-cyan-400">
                            ৳{itemSubtotal.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium px-1">
                          Note: Specific garments (Shirt, Pants, etc.) chosen on the Book Laundry page will appear itemized here.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Price Calculation */}
                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex justify-between items-center text-xs font-black text-slate-900 dark:text-white">
                    <span>Subtotal Price:</span>
                    <span className="text-sm text-blue-600 dark:text-cyan-400">৳{(itemSubtotal + addonSubtotal).toFixed(2)}</span>
                  </div>

                  {/* 3. Delete entire order option */}
                  <button
                    type="button"
                    onClick={() => { onRemove(service.id); onClose(); }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-black transition-all mt-1"
                  >
                    <Trash2 size={13} />
                    Delete Service from Laundry Bag
                  </button>
                </div>
              )}



              {/* ── Add-on Care Treatments ── */}
              {service.addons.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} />Care Treatments &amp; Addons
                  </p>
                  <div className="space-y-2">
                    {service.addons.map((addon) => {
                      const isSelected = cartItem?.selectedAddons.includes(addon.id) ?? false;
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => { if (inCart) onToggleAddon(service.id, addon.id); }}
                          disabled={!inCart}
                          className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : inCart
                              ? "bg-white border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                              : "bg-slate-50 border-slate-200/60 text-slate-500 opacity-75 cursor-not-allowed dark:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-white bg-white" : "border-current"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold leading-tight">{addon.addonName}</p>
                              {addon.description && (
                                <p className={`text-[10px] font-medium mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>{addon.description}</p>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs font-black ml-2 shrink-0 ${isSelected ? "text-white" : "text-blue-600 dark:text-cyan-400"}`}>+৳{addon.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer CTA ── */}
            <div className="sticky bottom-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex-shrink-0">
              {inCart ? (
                <Button onClick={onClose} className="w-full h-12 rounded-2xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/25">
                  <CheckCircle2 size={15} />
                  Done — Save Order Details
                </Button>
              ) : (
                <Button onClick={() => { onAdd(service); onClose(); }} className="w-full h-12 rounded-2xl font-black text-xs bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-lg shadow-blue-600/25">
                  <ShoppingBag size={15} />
                  Add to Laundry Bag
                  <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
