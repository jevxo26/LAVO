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
import Link from "next/link";

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
    <section className="relative overflow-hidden bg-background py-12 md:py-16 lg:py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[140px]" />
        <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-secondary/15 blur-[150px]" />
      </div>
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 mb-6">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Corporate Solutions
              </span>
            </div>

            <h2 className="mt-5 max-w-xl text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
              {title}
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {industries.map((ind: any, idx: number) => {
                const Icon = ind.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    {Icon ? <Icon className="text-primary" size={20} /> : null}
                    <span className="text-foreground font-semibold">{ind.title || ind.name}</span>
                  </div>
                );
              })}
            </div>
            <Link href={'/corporate'}
              className="inline-flex w-full cursor-pointer sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Corporate Laundry
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 flex flex-col gap-4"
          >
            <div className="rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
              <h3 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold mb-2">2,000+</h3>
              <p className="text-muted-foreground">Items processed weekly for enterprise clients</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
              <h3 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold mb-2">48 hr</h3>
              <p className="text-muted-foreground">Standard enterprise turnaround guarantee</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
              <h3 className="text-primary text-2xl md:text-3xl lg:text-4xl font-bold mb-2">100%</h3>
              <p className="text-muted-foreground">Digital invoicing and order management</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
