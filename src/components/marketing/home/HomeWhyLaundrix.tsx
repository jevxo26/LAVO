"use client";

import React from "react";
import { Zap, ShieldCheck, Globe, Users, Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
const iconMap = {
  Zap,
  ShieldCheck,
  Globe,
  Users,
};

export function HomeWhyLaundrix({ data }: { data?: any }) {
  const title = data?.title || "The Standard Others Try to Match";
  const subtitle = data?.subtitle || "LAUNDRIX combines enterprise-grade reliability with consumer-level simplicity. Every feature — from QR tracking to multi-branch management — is designed to save you time and eliminate laundry anxiety.";

  const features = data?.items?.length ? data.items : [
    {
      icon: Zap,
      title: "Technology-First",
      desc: "QR tracking, real-time updates, and digital receipts for every order."
    },
    {
      icon: ShieldCheck,
      title: "Garment Insurance",
      desc: "Every item fully insured. Zero risk, zero worry for your wardrobe."
    },
    {
      icon: Globe,
      title: "City-Wide Network",
      desc: "24 branches across 8 cities for maximum convenience."
    },
    {
      icon: Users,
      title: "Dedicated Support",
      desc: "Human support available via chat, phone, or email."
    }
  ];

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
              <Zap className="h-4 w-4 text-primary" />

              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Why Laundrix
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
              {title}
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              {subtitle}
            </p>

            <div className="mt-10 space-y-7">
              {features.map((item: any, idx: number) => {
                const Icon =
                  typeof item.icon === "string"
                    ? iconMap[item.icon as keyof typeof iconMap] || Zap
                    : item.icon || Zap;

                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div
                      className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary
                    "
                    >
                      {typeof Icon === 'string' ? <Zap size={20} /> : <Icon size={20} />}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {item.title}
                      </h3>

                      <p className="mt-1 leading-7 text-muted-foreground">
                        {item.content || item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2"
          >
            <div
              className="
                relative
                h-[500px]
                lg:h-[600px]
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-card
                shadow-xl
              "
            >
              <Image
                src="/images/home/whyLaundriximg.png"
                alt="Modern LAUNDRIX Facility"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Floating Card */}
              <div
                className="
              absolute
              bottom-6
              left-6
              right-6
              rounded-2xl
              border
              border-border
              bg-background/95
              p-5
              shadow-lg
              backdrop-blur-md
            "
              >
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Trusted by Thousands
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Premium garment care with consistent quality.
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex justify-end text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>

                    <p className="mt-1 text-sm font-semibold text-foreground">
                      4.9 / 5.0
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
