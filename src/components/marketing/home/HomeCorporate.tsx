"use client";

import React from "react";
import { Building2, UtensilsCrossed, Stethoscope, Briefcase, ArrowRight, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  UtensilsCrossed,
  Stethoscope,
  Briefcase,
};
import { motion } from "framer-motion";

export function HomeCorporate({ data }: { data?: any }) {
  const title = data?.title || "Enterprise Solutions for Your Business";
  const subtitle = data?.subtitle || "Dedicated solutions for hotels, restaurants, healthcare, and large enterprises. Volume pricing, weekly invoicing, and a dedicated account team.";
  
  const industries = data?.items?.length
    ? data.items.map((item: any) => ({
        ...item,
        icon: typeof item.icon === "string" ? ICON_MAP[item.icon] ?? null : item.icon,
      }))
    : [
        { name: "Hotels & Resorts", icon: Building2 },
        { name: "Restaurants", icon: UtensilsCrossed },
        { name: "Healthcare", icon: Stethoscope },
        { name: "Corporations", icon: Briefcase },
      ];

  return (
    <section className="bg-navy-dark py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              <span className="text-sm font-bold tracking-wider text-blue-500 uppercase">
                Corporate Solutions
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {title}
            </h2>
            
            <p className="text-slate-400 mb-10 text-lg">
              {subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {industries.map((ind: any, idx: number) => {
                const Icon = ind.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 rounded-xl px-5 py-4 transition-colors">
                    {Icon ? <Icon className="text-blue-500" size={20} /> : null}
                    <span className="text-white font-semibold">{ind.title || ind.name}</span>
                  </div>
                );
              })}
            </div>

            <button className="flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-sky-hover text-white px-6 py-3.5 rounded-full font-bold transition-colors w-full sm:w-auto shadow-lg">
              Corporate Laundry
              <ArrowRight size={18} />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 flex flex-col gap-4"
          >
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-brand-sky text-5xl font-bold mb-2">2,000+</h3>
              <p className="text-slate-400">Items processed weekly for enterprise clients</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-brand-sky text-5xl font-bold mb-2">48 hr</h3>
              <p className="text-slate-400">Standard enterprise turnaround guarantee</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-brand-sky text-5xl font-bold mb-2">100%</h3>
              <p className="text-slate-400">Digital invoicing and order management</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
