"use client";

import React from "react";
import { MapPin, Bell, Clock, QrCode, Wallet, Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function HomeMobileApp({ data }: { data?: any }) {
  const title = data?.title || "Laundry management in your pocket";
  const subtitle = data?.subtitle || "Book pickups, track every garment with QR, make payments, and manage your entire laundry life from our beautifully designed mobile app.";
  
  const features = data?.items?.length ? data.items : [
    {
      icon: MapPin,
      title: "Live Tracking",
      desc: "Real-time order & rider",
    },
    {
      icon: QrCode,
      title: "QR Scanner",
      desc: "Scan any garment status",
    },
    {
      icon: Bell,
      title: "Notifications",
      desc: "Instant order updates",
    },
    {
      icon: Wallet,
      title: "Wallet",
      desc: "Pay & manage balance",
    },
    {
      icon: Clock,
      title: "Order History",
      desc: "All past orders",
    },
    {
      icon: Star,
      title: "Reviews",
      desc: "Rate your experience",
    },
  ];

  return (
    <section className="bg-navy-dark py-24 border-t-4 border-blue-600 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-blue-600/20">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">
                MOBILE APP
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {title}
            </h2>
            
            <p className="text-slate-400 mb-12 text-lg">
              {subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-6 mb-12">
              {features.map((item: any, idx: number) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-500 shrink-0">
                      {Icon ? (typeof Icon === 'string' ? <span>{Icon}</span> : <Icon size={24} />) : <MapPin size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-400">{item.desc || item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.54-2.06.81-3.28.81-1.22 0-2.3-.27-3.28-.81-1.39-.75-2.28-1.51-2.65-2.26-.26-.51-.39-1.12-.39-1.84 0-.82.16-1.56.49-2.21.32-.65.73-1.17 1.23-1.55.5-.38 1.07-.63 1.7-.75.63-.12 1.3-.12 2 0 .7.12 1.34.37 1.9.75.56.38.99.9 1.29 1.55.3.65.45 1.39.45 2.21 0 .72-.13 1.33-.39 1.84-.37.75-1.26 1.51-2.65 2.26z"/></svg>
                <div className="text-left flex flex-col">
                  <span className="text-[10px] leading-tight text-slate-400">Download on</span>
                  <span className="text-sm font-bold leading-tight">App Store</span>
                </div>
              </button>
              
              <button className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors w-full sm:w-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3.5 20.5v-17c0-.83.67-1.5 1.5-1.5h14c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5H5c-.83 0-1.5-.67-1.5-1.5zm15-1.5v-14H5.5v14H18.5z"/></svg>
                <div className="text-left flex flex-col">
                  <span className="text-[10px] leading-tight text-slate-400">Get it on</span>
                  <span className="text-sm font-bold leading-tight">Google Play</span>
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2 flex justify-center lg:justify-end relative h-[600px]"
          >
            {/* Phone Mockup Placeholder since we don't have the exact image */}
            <div className="w-[300px] h-[600px] bg-blue-600 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
               <div className="absolute top-0 w-full h-7 bg-slate-800 rounded-b-3xl z-10 mx-auto left-0 right-0 w-[150px]"></div>
               <div className="p-6 pt-12 flex-1">
                 <p className="text-blue-200 text-xs mb-1">Good morning,</p>
                 <h3 className="text-white font-bold text-xl mb-6">Rahul Islam 👋</h3>
                 
                 <div className="flex gap-2 mb-6">
                   <div className="bg-blue-500 rounded-xl p-3 flex-1 text-center">
                     <p className="text-blue-200 text-[10px]">Wallet</p>
                     <p className="text-white font-bold">৳1,240</p>
                   </div>
                   <div className="bg-blue-500 rounded-xl p-3 flex-1 text-center">
                     <p className="text-blue-200 text-[10px]">Orders</p>
                     <p className="text-white font-bold">12 total</p>
                   </div>
                   <div className="bg-blue-500 rounded-xl p-3 flex-1 text-center">
                     <p className="text-blue-200 text-[10px]">Points</p>
                     <p className="text-white font-bold">340 pt</p>
                   </div>
                 </div>
               </div>
               <div className="bg-white h-[350px] rounded-t-3xl p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-slate-900">Active Order</span>
                     <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">In Progress</span>
                   </div>
                   <p className="text-[10px] text-slate-500 mb-3">#LXR-8821 · Wash & Fold (6 pcs)</p>
                   <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                     <div className="bg-blue-500 w-1/2 h-full"></div>
                   </div>
                   <p className="text-[9px] text-slate-400">Step 4 of 7 · Washing</p>
                 </div>
                 
                 <div className="flex justify-between items-center mb-6">
                   <div className="flex flex-col items-center">
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-1"><MapPin size={16}/></div>
                     <span className="text-[9px] text-slate-500">Book</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-1"><QrCode size={16}/></div>
                     <span className="text-[9px] text-slate-500">Track</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-1"><MapPin size={16}/></div>
                     <span className="text-[9px] text-slate-500">Scan</span>
                   </div>
                   <div className="flex flex-col items-center">
                     <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-1"><Bell size={16}/></div>
                     <span className="text-[9px] text-slate-500">Help</span>
                   </div>
                 </div>
                 
                 <h4 className="text-xs font-bold text-slate-900 mb-3">Services</h4>
                 <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-slate-600">Wash & Fold</span>
                     <div className="flex items-center gap-2">
                       <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Popular</span>
                       <span className="text-[11px] font-bold">৳40</span>
                     </div>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-[11px] text-slate-600">Dry Cleaning</span>
                     <span className="text-[11px] font-bold">৳150</span>
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
