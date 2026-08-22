"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Truck, Sparkles, QrCode, Calendar, Map } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

// Use dynamic import for the map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/marketing/coverage/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading map...</div>
});

export function HomeCoverage({ data }: { data?: any }) {
  const [showMap, setShowMap] = useState(false);

  const title = data?.title || "We Come to You";
  const subtitle = data?.subtitle || "Check if LAUNDRIX serves your area. Pickup available 7 days a week.";

  const bottomCards = [
    {
      title: "Dhaka",
      desc: "Full Coverage"
    },
    {
      title: "Chattogram",
      desc: "Full Coverage"
    },
    {
      title: "Sylhet",
      desc: "Full Coverage"
    },
    {
      title: "Rajshahi",
      desc: "Full Coverage"
    },
    {
      title: "Khulna",
      desc: "Partial Coverage"
    },
  ];
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
            <Map className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              COVERAGE
            </span>
          </div>
          <h2 className="mt-5 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
            {title}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-16 relative"
        >
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Enter your zip code or neighborhood..."
              className="w-full pl-12 pr-24 py-4 rounded-full border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm bg-slate-50"
            />
            <button
              onClick={() => setShowMap(true)}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-full font-semibold transition-colors"
            >
              Check
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative w-full h-[400px] md:h-[300px] rounded-[32px] overflow-hidden shadow-sm border border-slate-200 bg-slate-100"
        >
          {showMap ? (
            <MapComponent />
          ) : (
            // <div className="absolute inset-0 bg-[url('/images/home/map.png')] bg-cover bg-center "></div>
            <div className="absolute inset-0">
              <Image
                src="/images/home/map.png"
                alt="Coverage Map"
                fill
                className="object-cover object-center"
              />
            </div>
          )}

          {!showMap && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl px-8 py-6 shadow-xl text-center max-w-sm w-full z-10 border border-slate-100">
                <div className=" rounded-full flex items-center justify-center text-blue-600 mx-auto mb-2">
                  <MapPin size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">View Interactive Coverage Map</h3>
                <p className="text-sm text-slate-500 mb-6">NYC · 5 boroughs · expanding</p>
                <button
                  onClick={() => setShowMap(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                >
                  View Full Coverage
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
              </div>
            </div>
          )}
        </motion.div>
        {/* Bottom 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {bottomCards.map((card, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              className="bg-white border mt-3 border-slate-100 text-center rounded-2xl px-6 py-2 hover:shadow-md transition-shadow"
            >
              <div className="flex-col items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${card.desc === "Full Coverage"
                      ? "bg-green-500"
                      : "bg-orange-500"
                    }`}
                />
                <h4 className="font-bold text-slate-900 mb-3">{card.title}</h4>
              </div>
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
