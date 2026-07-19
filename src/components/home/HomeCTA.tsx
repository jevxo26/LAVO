"use client";

import React from "react";
import { ArrowRight, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";

export function HomeCTA({ data }: { data?: any }) {
  const title = data?.title || "Ready for Clean, On Demand?";
  const subtitle = data?.subtitle || "Join 12,000+ customers who trust LAUNDRIX for premium garment care.";

  return (
    <section className="bg-blue-700 py-24 border-t border-blue-600">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-blue-200 mb-10">
            {subtitle}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <button className="flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-8 py-3.5 rounded-full font-bold transition-colors w-full sm:w-auto shadow-lg">
            Schedule Pickup
            <ArrowRight size={18} />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-8 py-3.5 rounded-full font-bold transition-colors w-full sm:w-auto shadow-lg">
            Contact Sales
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-blue-200 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-300" />
            <span>No setup fee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-300 font-bold">⚡</span>
            <span>Live in 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-blue-300" />
            <span>30-day free trial</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
