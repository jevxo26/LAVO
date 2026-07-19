"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  badgeText?: string;
  title?: string;
  description?: string;
  data?: any;
}

export function PageHero({ badgeText, title, description, data }: PageHeroProps) {
  const displayBadge = data?.subtitle || badgeText || "Page";
  const displayTitle = data?.title || title || "Title";
  const displayDesc = data?.content || description || "";

  return (
    <section className="relative w-full pt-32 pb-12 md:pb-16 lg:pb-20 px-4 overflow-hidden bg-gradient-to-b from-[#1a365d] to-[#0f172a] text-white">
      <div className="absolute inset-0 bg-blue-900/10 bg-[url('/noise.png')] mix-blend-overlay opacity-50" />
      
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-6"
        >
          <Sparkles size={14} className="text-blue-300" />
          <span className="text-xs font-semibold tracking-wider text-blue-100 uppercase">
            {displayBadge}
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white leading-tight"
        >
          {displayTitle}
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed"
        >
          {displayDesc}
        </motion.p>
      </div>
    </section>
  );
}
