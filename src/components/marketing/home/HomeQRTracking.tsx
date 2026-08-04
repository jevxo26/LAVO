"use client";

import React from "react";
import { ArrowRight, Check, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HomeQRTracking({ data }: { data?: any }) {
  const title = data?.title || "Every Garment Has an Identity";
  const subtitle = data?.subtitle || "Each item receives a unique QR code at pickup. Scan it anytime from any device to see real-time status — from intake through cleaning, pressing, and delivery.";

  const steps = [
    { label: "Pickup Collected", time: "9:15 AM", active: true, dot: true },
    { label: "QR Tags Applied", time: "10:30 AM", active: true, dot: true },
    { label: "Wash Cycle", time: "12:00 PM", active: true, dot: true },
    { label: "Pressing & Folding", time: "In progress", active: false, current: true },
    { label: "Quality Check", time: "Pending", active: false },
    { label: "Out for Delivery", time: "Est. 4 PM", active: false },
  ];

  return (
    // <section className="bg-navy-dark py-12 md:py-16 lg:py-20 border-t border-slate-800">
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-16 lg:py-24">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[140px]" />

        <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-secondary/15 blur-[150px]" />
      </div>
      {/* <div className="max-w-7xl mx-auto px-4 md:px-6"> */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            {/* <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-primary/20"> */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
              <QrCode className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold tracking-wider text-primary uppercase">
                QR TRACKING
              </span>
            </div>

            <h2 className="mt-5 max-w-xl text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
              {title}
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              {subtitle}
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check size={14} />
                </div>
                <span className="text-base text-muted-foreground">Real-time garment-level tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-base text-muted-foreground">Scan with any smartphone camera</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-base text-muted-foreground">Instant status notifications</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-base text-muted-foreground">Full processing timeline history</span>
              </li>
            </ul>

            <Link href={'/services'} className="inline-flex w-full cursor-pointer sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
              Learn How It Works
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <div className="relative rounded-3xl border border-border bg-white/55 p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30">
              <div className="flex justify-between items-center mb-10">
                <span className="text-xs font-mono tracking-wider text-muted-foreground">ORDER #LXR-2025-04821</span>
                <span className="rounded-full bg-warning/15 px-3 py-1 text-[10px] font-semibold text-warning">In Processing</span>
              </div>

              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-border" />
                <div className="absolute left-3 top-4 bottom-[40%] w-0.5 bg-primary" />

                <div className="relative z-10 space-y-8">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full border-white/40 transition-colors duration-300
                          ${step.active
                              ? "border-primary bg-primary text-primary-foreground"
                              : step.current
                                ? "border-primary bg-card"
                                : "border-border bg-card"
                            }
                          `}
                        >
                          {step.active && <Check size={14} />}

                          {step.current && (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                          )}
                        </div>

                        <span
                          className={`font-medium ${step.active || step.current
                            ? "text-foreground"
                            : "text-muted-foreground"
                            }`}
                        >
                          {step.label}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-mono ${step.active
                          ? "text-primary"
                          : "text-muted-foreground"
                          }`}
                      >
                        {step.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
