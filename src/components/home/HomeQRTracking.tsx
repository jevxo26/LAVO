"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="bg-[#0F172A] py-24 border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-blue-600/20">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                QR TRACKING
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {title}
            </h2>
            
            <p className="text-slate-400 mb-10 text-lg">
              {subtitle}
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-slate-300">Real-time garment-level tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-slate-300">Scan with any smartphone camera</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-slate-300">Instant status notifications</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                  <Check size={14} />
                </div>
                <span className="text-slate-300">Full processing timeline history</span>
              </li>
            </ul>

            <button className="flex items-center justify-center gap-2 bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-8 py-3.5 rounded-full font-bold transition-colors w-full sm:w-auto shadow-lg">
              Track Your Order
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <div className="bg-[#192135] rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
              <div className="flex justify-between items-center mb-10">
                <span className="text-xs font-mono text-slate-500 tracking-wider">ORDER #LXR-2025-04821</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full font-bold">In Processing</span>
              </div>

              <div className="relative">
                {/* Vertical line connecting the dots */}
                <div className="absolute top-4 bottom-4 left-3 w-0.5 bg-slate-800 z-0"></div>
                <div className="absolute top-4 bottom-[40%] left-3 w-0.5 bg-blue-600 z-0"></div>

                <div className="space-y-8 relative z-10">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                          ${step.active 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : step.current
                              ? 'border-blue-600 bg-[#192135]'
                              : 'border-slate-700 bg-[#192135]'
                          }
                        `}>
                          {step.active && <Check size={14} />}
                          {step.current && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>}
                        </div>
                        <span className={`font-medium ${step.active || step.current ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                        </span>
                      </div>
                      <span className={`text-xs font-mono ${step.active ? 'text-blue-400' : 'text-slate-600'}`}>
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
