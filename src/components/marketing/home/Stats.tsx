"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  {
    number: "50K+",
    label: "Orders Completed",
    icon: "📦",
  },
  {
    number: "25K+",
    label: "Happy Customers",
    icon: "😊",
  },
  {
    number: "15+",
    label: "Active Branches",
    icon: "🏢",
  },
  {
    number: "200+",
    label: "Partner Vendors",
    icon: "🤝",
  },
];

export function Stats() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Our platform has revolutionized laundry service delivery across
            Bangladesh
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-8 text-center hover:border-blue-200 transition-all duration-300">
                <div className="text-5xl md:text-6xl mb-4">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
