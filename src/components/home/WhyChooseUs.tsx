"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Zap,
  Shield,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";

const reasons = [
  {
    icon: Smartphone,
    title: "QR Tracking",
    description: "Real-time QR code tracking for complete order transparency",
  },
  {
    icon: Zap,
    title: "Real-Time Updates",
    description: "Get instant notifications at every step of your journey",
  },
  {
    icon: Shield,
    title: "Trusted Professionals",
    description: "Verified and trained professionals with background checks",
  },
  {
    icon: Clock,
    title: "Fast Pickup",
    description: "Same-day pickup available in all service areas",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Multiple payment options with 100% security guarantee",
  },
  {
    icon: MapPin,
    title: "Multi-Branch Service",
    description: "Available across 15+ branches throughout Bangladesh",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why Choose LAUNDRIX?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Experience the difference with our cutting-edge features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative bg-gradient-to-br from-white to-blue-50/50 border border-blue-100/50 rounded-2xl p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  {/* Icon background */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} className="text-blue-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-slate-600">{reason.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
