"use client";

import React from "react";
import { Calendar, Truck, QrCode, Sparkles, ShieldCheck, Package } from "lucide-react";
import { motion } from "framer-motion";

// Helper to render icon
const getIcon = (name: string, props: any) => {
  const IconMap: Record<string, any> = { Calendar, Truck, QrCode, Sparkles, ShieldCheck, Package };
  const Icon = IconMap[name] || Calendar;
  return <Icon {...props} />;
};

export function HomeProcess({ data }: { data?: any }) {
  const title = data?.title || "Six Steps to Perfectly Clean";
  const subtitle = data?.subtitle || "From a single tap to delivery at your door — every step tracked, automated, and transparent.";
  
  const steps = data?.items?.length ? data.items : [
    { icon: "Calendar", title: "Book", desc: "Schedule your pickup in under 60 seconds.", num: "01" },
    { icon: "Truck", title: "Pickup", desc: "We collect at your chosen time window.", num: "02" },
    { icon: "QrCode", title: "QR Tagging", desc: "Every garment gets a unique QR identity.", num: "03" },
    { icon: "Sparkles", title: "Processing", desc: "Expert cleaning using premium products.", num: "04" },
    { icon: "ShieldCheck", title: "Quality Check", desc: "Multi-point inspection before packaging.", num: "05" },
    { icon: "Package", title: "Delivery", desc: "Clean clothes returned to your door.", num: "06" }
  ];

  const bottomCards = [
    {
      icon: Calendar,
      title: "Book & Pay",
      desc: "Select service, garments, and slot. Pay instantly via bKash, card, or wallet."
    },
    {
      icon: QrCode,
      title: "Pickup & QR Tag",
      desc: "Agent collects your laundry. Every garment tagged with a unique trackable QR code."
    },
    {
      icon: Sparkles, // placeholder for refresh icon
      title: "Process & Inspect",
      desc: "Vendor processes garments. Quality check at every stage. Zero tolerance for errors."
    },
    {
      icon: Truck, // placeholder for delivery truck
      title: "Pack & Deliver",
      desc: "Packaged securely and delivered on schedule. Rate your experience in-app."
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-blue-50">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              The Process
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {title}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Top 6 Icons Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-10 left-12 right-12 h-[2px] bg-blue-100 z-0"></div>
          
          {steps.map((step: any, idx: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="flex flex-col items-center text-center relative z-10"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-[#1f5df9] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform transition-transform hover:scale-105">
                  {getIcon(step.icon, { size: 32 })}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold border-4 border-white shadow-sm">
                  {step.subtitle || step.num}
                </div>
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
              <p className="text-xs text-slate-500 max-w-[140px] leading-relaxed">{step.content || step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bottomCards.map((card, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-slate-500 mb-4">
                {(() => {
                  const Icon = card.icon;
                  return <Icon size={20} />;
                })()}
              </div>
              <h4 className="font-bold text-slate-900 mb-3">{card.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
