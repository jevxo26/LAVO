"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ServicesHero() {
  return (
    <section className="relative w-full pt-32 pb-12 md:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-b from-[#1a365d] to-[#0f172a] text-white">
      <div className="absolute inset-0 bg-blue-900/10 bg-[url('/noise.png')] mix-blend-overlay opacity-50" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-8"
        >
          <Sparkles size={14} className="text-blue-300" />
          <span className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
            Our Services
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-tight"
        >
          Professional Laundry Services
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Every garment deserves expert care. From everyday essentials to delicate designer pieces — we have a service for every wardrobe.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-white/20"
          >
            Schedule Pickup
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            View Pricing
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
