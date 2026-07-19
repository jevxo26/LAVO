"use client";

import React from "react";
import { Zap, ShieldCheck, Globe, Users, Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center justify-center px-3 py-1 mb-6 rounded-full bg-blue-50">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
              <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                WHY LAUNDRIX
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {title}
            </h2>
            
            <p className="text-slate-500 mb-12 text-lg leading-relaxed max-w-xl">
              {subtitle}
            </p>

            <div className="space-y-8">
              {features.map((item: any, idx: number) => {
                const Icon = item.icon || Zap;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      {typeof Icon === 'string' ? <Zap size={20} /> : <Icon size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.content || item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 w-full"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[600px] w-full bg-slate-100">
              <Image 
                src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=1200" 
                alt="LAUNDRIX Facility"
                fill
                className="object-cover"
              />
              
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 shadow-lg border border-slate-100">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white">SM</div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white">JT</div>
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold border-2 border-white">PS</div>
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold border-2 border-white">MR</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">50,000+ Happy Customers</h4>
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 font-medium ml-1">4.9 / 5.0</span>
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
