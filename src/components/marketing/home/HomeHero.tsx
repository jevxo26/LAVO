"use client";

import { ArrowRight, QrCode, Shield, Truck, CheckCircle, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Helper to render icon based on string name
const getIcon = (name: string, props: any) => {
  const IconMap: Record<string, any> = { QrCode, Shield, Truck, CheckCircle, MapPin };
  const Icon = IconMap[name] || CheckCircle;
  return <Icon {...props} />;
};

export function HomeHero({ data }: { data?: any }) {
  const title = data?.title || "Smart Laundry, Perfectly Delivered.";
  const titleParts = title.split(", ");
  const subtitle = data?.subtitle || "Book pickup in under a minute. We wash, dry clean, iron and deliver your clothes safely across Dhaka, Chattogram, Sylhet and beyond.";
  
  const features = data?.items?.length ? data.items : [
    { title: "QR Tracking", icon: "QrCode" },
    { title: "Secure Payment", icon: "Shield" },
    { title: "On-Time Delivery", icon: "Truck" },
    { title: "Verified Service", icon: "CheckCircle" },
  ];

  return (
    <>
      {/* Hero Section - exact screen height minus navbar (64px / 4rem) */}
      <section className="w-full bg-surface-light min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative w-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            
            {/* Left Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs md:text-sm font-semibold text-slate-700 mb-6 shadow-sm">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
                Now serving 8 cities · 8 branches
              </div>

              <h1 className="text-[3rem] md:text-[4rem] lg:text-[4.25rem] leading-[1.1] font-bold text-slate-900 mb-6 tracking-tight">
                {titleParts[0]}{titleParts.length > 1 ? "," : ""} <br />
                {titleParts.length > 1 && (
                  <span className="text-brand-blue">{titleParts.slice(1).join(", ")}</span>
                )}
              </h1>

              <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-[95%]">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href="/book" className="px-8 py-4 bg-brand-blue text-white font-bold rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-base">
                  Schedule Pickup <ArrowRight size={18} />
                </Link>
                <Link href="/services" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-base">
                  Explore Services
                </Link>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                {features.map((feature: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      {getIcon(feature.icon, { size: 14 })}
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-slate-600">{feature.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Image Content */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-full w-full hidden lg:flex justify-end items-center"
            >
              <div className="w-full h-[500px] xl:h-[560px] bg-slate-200 rounded-[32px] overflow-hidden shadow-2xl relative">
                 <Image 
                   src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=1200" 
                   alt="Smart Laundry App"
                   fill
                   className="object-cover"
                 />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm p-8">
                   <div className="bg-white/90 p-4 rounded-xl text-center shadow-lg backdrop-blur-md">
                     <p className="text-sm font-bold text-slate-800">Asset placeholder for App & Delivery Mockup</p>
                   </div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blue Stats Bar - rendered separately below hero screen height */}
      <div className="w-full bg-brand-blue py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center text-white"
          >
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">120K+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Orders Processed</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">1.4M+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Garments Cleaned</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">48</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Branches</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">310+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Verified Vendors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">22</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Cities Covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold mb-0.5">98.6%</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Satisfaction Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
