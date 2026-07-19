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
    <section className="w-full bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-0 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl pb-16 lg:pb-24"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm font-semibold text-slate-700 mb-8 shadow-sm">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
              Now serving 8 cities · 24 branches
            </div>

            <h1 className="text-[3.5rem] md:text-[4.5rem] leading-[1.1] font-bold text-slate-900 mb-6 tracking-tight">
              {titleParts[0]}{titleParts.length > 1 ? "," : ""} <br />
              {titleParts.length > 1 && (
                <span className="text-[#1f5df9]">{titleParts.slice(1).join(", ")}</span>
              )}
            </h1>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-[90%]">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link href="/book" className="px-8 py-4 bg-[#1f5df9] text-white font-bold rounded-full flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 text-lg">
                Schedule Pickup <ArrowRight size={20} />
              </Link>
              <Link href="/services" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm text-lg">
                Explore Services
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 md:gap-10">
              {features.map((feature: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    {getIcon(feature.icon, { size: 16 })}
                  </div>
                  <span className="text-sm font-semibold text-slate-600">{feature.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Image Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-full w-full hidden lg:flex justify-end items-end pb-16 lg:pb-24"
          >
            {/* The user provided a screenshot with a rendered 3D scene mockup. In absence of the actual asset, we will use an image placeholder with similar proportions, or use an unsplash placeholder. 
                Using a generic unsplash image placeholder that fits the laundry theme for now, but in reality we would use the specific asset provided by the user. 
            */}
            <div className="w-full h-[600px] bg-slate-200 rounded-[32px] overflow-hidden shadow-2xl relative">
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

      {/* Blue Stats Bar */}
      <div className="w-full bg-[#1f5df9] py-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 text-center text-white"
          >
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">120K+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Orders Processed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">1.4M+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Garments Cleaned</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">48</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Branches</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">310+</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Verified Vendors</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">22</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Cities Covered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-1">98.6%</div>
              <div className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">Satisfaction Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
