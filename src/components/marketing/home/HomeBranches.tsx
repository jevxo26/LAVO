"use client";

import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HomeBranches({ data }: { data?: any }) {
  const title = data?.title || "Find a Branch Near You";
  
  const branches = data?.items?.length ? data.items : [
    {
      name: "Downtown Hub",
      address: "42 Commerce St, Downtown",
      time: "Mon-Sat 7am-9pm · Sun 9am-6pm",
    },
    {
      name: "Midtown Express",
      address: "118 Park Ave, Midtown",
      time: "Mon-Fri 6am-10pm · Sat-Sun 8am-8pm",
    },
    {
      name: "Brooklyn Central",
      address: "55 Atlantic Ave, Brooklyn",
      time: "Mon-Sat 7am-9pm · Sun 10am-5pm",
    },
    {
      name: "Queens Plaza",
      address: "200 Northern Blvd, Queens",
      time: "Daily 7am-9pm",
    },
  ];

  return (
    <section className="py-24 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-blue-50">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              BRANCHES
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {branches.map((branch: any, idx: number) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{branch.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{branch.address}</p>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span className="font-mono">🕒</span>
                <span>{branch.time}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            View All Branches
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
