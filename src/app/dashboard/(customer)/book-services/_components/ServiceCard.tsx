"use client";

import { Heart, Clock, Tag, Plus, ChevronRight } from "lucide-react";
import type { Service } from "../_types";

interface ServiceCardProps {
  service: Service;
  inCart: boolean;
  onAdd: (service: Service) => void;
  onToggleWishlist: (service: Service) => void;
}

export function ServiceCard({ service, inCart, onAdd, onToggleWishlist }: ServiceCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        inCart
          ? "border-indigo-300 shadow-md shadow-indigo-50 ring-1 ring-indigo-200"
          : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
      }`}
    >
      {inCart && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-bold text-slate-900 text-sm leading-tight">{service.serviceName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {service.garmentType}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock size={9} />
                {service.estimatedTime}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggleWishlist(service)}
            className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
              service.isWishlisted
                ? "bg-rose-50 text-rose-500 border-rose-100"
                : "bg-slate-50 text-slate-300 border-slate-100 hover:text-rose-400 hover:bg-rose-50 hover:border-rose-100"
            }`}
          >
            <Heart size={13} fill={service.isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <span className="text-xl font-extrabold text-slate-900">৳{service.basePrice.toFixed(2)}</span>
            {service.addons.length > 0 && (
              <span className="text-[10px] text-slate-400 ml-1.5 inline-flex items-center gap-0.5">
                <Tag size={8} />
                {service.addons.length} add-ons
              </span>
            )}
          </div>
          <button
            onClick={() => onAdd(service)}
            disabled={inCart}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              inCart
                ? "bg-indigo-600 text-white cursor-default"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100"
            }`}
          >
            {inCart ? <><ChevronRight size={12} /> Added</> : <><Plus size={12} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}
