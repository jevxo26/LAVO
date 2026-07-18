"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const services = [
  {
    icon: "🧺",
    title: "Wash Only",
    description: "Professional washing with premium detergents",
    features: ["Eco-friendly", "Gentle care", "Fast turnaround"],
  },
  {
    icon: "🧴",
    title: "Wash + Fold",
    description: "Washing and expert folding for perfect presentation",
    features: ["Neat folding", "Premium packaging", "Quick delivery"],
  },
  {
    icon: "👔",
    title: "Wash + Iron",
    description: "Pristine pressed clothes delivered to you",
    features: ["Professional ironing", "Wrinkle-free", "Hangers included"],
  },
  {
    icon: "👗",
    title: "Dry Cleaning",
    description: "Specialized care for delicate fabrics",
    features: ["Delicate handling", "Fabric safe", "Expert care"],
  },
  {
    icon: "✨",
    title: "Steam Iron",
    description: "Premium steam ironing for all fabric types",
    features: ["Professional finish", "Premium care", "Quick service"],
  },
  {
    icon: "💎",
    title: "Premium Care",
    description: "White glove service for luxury items",
    features: ["VIP treatment", "Best care", "Priority delivery"],
  },
];

export function Services() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-transparent via-blue-50/30 to-transparent">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect laundry service for your needs
          </p>
        </motion.div>

        <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group relative"
            >
              {/* Gradient background hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-cyan-100/0 group-hover:from-blue-100/50 group-hover:to-cyan-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>

              {/* Card */}
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {/* Icon */}
                <div className="text-5xl mb-4">{service.icon}</div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm mb-6 flex-grow">
                  {service.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check
                        size={18}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      </div>
    </section>
  );
}
