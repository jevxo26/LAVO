"use client";

import React, { useState } from "react";
import {
  Shirt, Clock, Tag, Plus, Minus, Heart, Check, Sparkles, ChevronDown, ChevronUp, ShieldCheck
} from "lucide-react";
import type { Service, CartItem } from "../_types";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceCatalogGridProps {
  services: Service[];
  cart: CartItem[];
  onAddToCart: (service: Service) => void;
  onUpdateQuantity: (serviceId: string, change: number) => void;
  onRemoveFromCart: (serviceId: string) => void;
  onToggleAddon: (serviceId: string, addonId: string) => void;
  onToggleWishlist: (service: Service) => void;
}

const GRADIENTS = [
  "from-indigo-600 to-violet-600",
  "from-violet-600 to-purple-600",
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export function ServiceCatalogGrid({
  services,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onToggleAddon,
  onToggleWishlist,
}: ServiceCatalogGridProps) {
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});

  const toggleAddonDrawer = (serviceId: string) => {
    setExpandedAddons((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const cartItem = cart.find((i) => i.service.id === service.id);
        const inCart = !!cartItem;
        const gradient = gradientFor(service.serviceName);
        const isAddonOpen = !!expandedAddons[service.id];

        return (
          <motion.div
            key={service.id}
            whileHover={{ y: -4 }}
            className={`group relative flex flex-col justify-between rounded-3xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl overflow-hidden ${
              inCart
                ? "border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-500"
                : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-300"
            }`}
          >
            {/* Top Banner Accent */}
            <div className={`h-28 bg-gradient-to-br ${gradient} p-4 flex items-start justify-between relative overflow-hidden`}>
              <div className="pointer-events-none absolute inset-0 opacity-15">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white blur-xl" />
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-black/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-white border border-white/20 uppercase tracking-wider">
                  <Tag size={10} /> {service.category}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onToggleWishlist(service)}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-2xl border backdrop-blur-md transition-all ${
                  service.isWishlisted
                    ? "bg-rose-500 text-white border-rose-400 shadow-md"
                    : "bg-white/20 text-white border-white/20 hover:bg-white hover:text-rose-500"
                }`}
              >
                <Heart size={14} fill={service.isWishlisted ? "currentColor" : "none"} />
              </button>

              <div className="absolute -bottom-4 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 z-10">
                <Shirt size={28} />
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 pt-7 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 transition-colors">
                    {service.serviceName}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-xl">
                    {service.garmentType}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {service.estimatedTime}
                  </span>
                </div>
              </div>

              {/* Price & Treatment Addons Trigger */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Cleaning Price</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">৳{service.basePrice.toFixed(2)}</span>
                  </div>

                  {service.addons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleAddonDrawer(service.id)}
                      className="flex items-center gap-1 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {service.addons.length} Care Addons
                      {isAddonOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                </div>

                {/* Collapsible Addons Drawer */}
                <AnimatePresence>
                  {isAddonOpen && service.addons.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-1.5 pt-2"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Extra Treatments</p>
                      <div className="space-y-1">
                        {service.addons.map((addon) => {
                          const isChecked = cartItem?.selectedAddons.includes(addon.id);
                          return (
                            <button
                              key={addon.id}
                              type="button"
                              onClick={() => {
                                if (!inCart) onAddToCart(service);
                                onToggleAddon(service.id, addon.id);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isChecked
                                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span>{addon.addonName}</span>
                              <span className="font-black text-indigo-600 dark:text-indigo-400">+৳{addon.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add to Booking Button / Quantity Counter */}
                <div className="pt-2">
                  {!inCart ? (
                    <button
                      type="button"
                      onClick={() => onAddToCart(service)}
                      className="w-full h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Plus size={16} /> Add to Booking
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 rounded-2xl p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (cartItem.quantity === 1) onRemoveFromCart(service.id);
                          else onUpdateQuantity(service.id, -1);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-indigo-100 transition-colors font-black"
                      >
                        <Minus size={14} />
                      </button>

                      <div className="text-center">
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 block">
                          {cartItem.quantity} in Bag
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(service.id, 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-500 transition-colors font-black"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
