"use client";

import { ArrowRight, QrCode, Shield, Truck, CheckCircle, MapPin, Sparkles } from "lucide-react";
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
      <section className="w-full py-12 md:py-16 lg:py-20 bg-surface-light min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex items-center overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-100 blur-[120px] opacity-30" />
        <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-sky-100 blur-[120px] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 lg:py-20 relative w-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">

            {/* Left Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 my-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs text-slate-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-brand-blue" />
                <span>Serving 8 Cities • 24 Branches</span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl leading-[0.95] font-bold text-slate-900 mb-6 tracking-[-0.04em]">
                {titleParts[0]}{titleParts.length > 1 ? "," : ""} <br />
                {titleParts.length > 1 && (
                  <span className="text-brand-blue">{titleParts.slice(1).join(", ")}</span>
                )}
              </h1>

              <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed max-w-[95%]">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link href="/book" className="px-8 py-4 bg-brand-blue text-white font-bold rounded-full flex items-center gap-2 hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300  shadow-lg shadow-blue-500/30 text-base">
                  Schedule Pickup <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/services" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors text-base">
                  Explore Services
                </Link>
              </div>

              <div className="flex items-center gap-4 md:gap-8">
                {features.map((feature: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
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
              // className="relative w-full h-full hidden lg:flex justify-end items-center"
              className="relative h-full w-full hidden lg:flex justify-end items-center"
            >
              {/* <div className="w-full h-[500px] xl:h-[560px] bg-slate-200 rounded-[32px] overflow-hidden shadow-2xl relative"> */}
              <div className="relative aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[32px]">
                <Image
                  src="/images/home/hero.png"
                  alt="Smart Laundry App"
                  fill
                  // priority
                  // sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
                {/* <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm p-8">
                  <div className="bg-white/90 p-4 rounded-xl text-center shadow-lg backdrop-blur-md">
                    <p className="text-sm font-bold text-slate-800">Asset placeholder for App & Delivery Mockup</p>
                  </div>
                </div> */}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blue Stats Bar - rendered separately below hero screen height */}
      <div className="w-full bg-brand-blue">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y divide-white/15 md:divide-y-0 md:divide-x "
          >
            {[
              ["120K+", "Orders Processed"],
              ["1.4M+", "Garments Cleaned"],
              ["48", "Branches"],
              ["310+", "Verified Vendors"],
              ["22", "Cities Covered"],
              ["98.6%", "Satisfaction Rate"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="py-8 flex flex-col items-center justify-center"
              >
                <h3 className="text-3xl text-white md:text-4xl font-bold">{value}</h3>
                <p className="mt-2 text-xs uppercase tracking-widest text-white/80">
                  {label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
