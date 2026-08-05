"use client";

import { Heart, Clock, Tag, Plus, Check, Shirt } from "lucide-react";
import type { Service } from "../_types";
import { motion } from "framer-motion";

interface ServiceCardProps {
  service: Service;
  inCart: boolean;
  onAdd: (service: Service) => void;
  onToggleWishlist: (service: Service) => void;
}

export function ServiceCard({ service, inCart, onAdd, onToggleWishlist }: ServiceCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`relative bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden ${
        inCart
          ? "border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-400"
          : "border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-200"
      }`}
    >
      {inCart && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
      )}
      
      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{service.serviceName}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-xl font-extrabold">
                {service.garmentType}
              </span>
              <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <Clock size={11} />
                {service.estimatedTime}
              </span>
            </div>
          </div>

          <button
            onClick={() => onToggleWishlist(service)}
            className={`p-2 rounded-2xl border transition-all flex-shrink-0 ${
              service.isWishlisted
                ? "bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900/60"
                : "bg-slate-50 text-slate-300 border-slate-200 hover:text-rose-500 hover:bg-rose-50 dark:bg-slate-800 dark:border-slate-700"
            }`}
          >
            <Heart size={14} fill={service.isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xl font-black text-slate-900 dark:text-white">৳{service.basePrice.toFixed(2)}</span>
            {service.addons.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 ml-1.5 inline-flex items-center gap-0.5">
                <Tag size={10} />
                {service.addons.length} treatments
              </span>
            )}
          </div>

          <button
            onClick={() => onAdd(service)}
            disabled={inCart}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              inCart
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/50 dark:text-blue-300"
            }`}
          >
            {inCart ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
