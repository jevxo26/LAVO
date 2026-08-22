"use client";

import React from "react";
import { ArrowRight, Shield, Check, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HomeCTA({ data }: { data?: any }) {
  const title = data?.title || "Ready for Clean, On Demand?";
  const subtitle = data?.subtitle || "Join 12,000+ customers who trust LAUNDRIX for premium garment care.";

  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-16 lg:py-20 ">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-secondary/15 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-[1380px] mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>

          <p className="text-muted-foreground mb-10">
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
          <Link href="/services" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
            Schedule Pickup
            <ArrowRight size={18} />
          </Link>
          <Link href={'/contact'} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 font-semibold text-foreground transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
            Contact Sales
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-blue-200 text-sm"
        >
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="text-primary">No setup fee</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <span className="text-primary">Live in 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-primary" />
            <span className="text-primary">30-day free trial</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
