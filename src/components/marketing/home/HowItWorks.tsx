"use client";

import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Book Pickup",
    description: "Schedule your laundry pickup from your home",
    icon: "📱",
    color: "from-blue-500 to-blue-600",
  },
  {
    number: "2",
    title: "We Pick It Up",
    description: "Our professionals arrive and collect your laundry",
    icon: "🚚",
    color: "from-cyan-500 to-blue-600",
  },
  {
    number: "3",
    title: "QR Tracking",
    description: "Get a unique QR code to track your order",
    icon: "📷",
    color: "from-green-500 to-cyan-600",
  },
  {
    number: "4",
    title: "Processing",
    description: "Your laundry is processed with care",
    icon: "✨",
    color: "from-purple-500 to-blue-600",
  },
  {
    number: "5",
    title: "Quality Check",
    description: "Rigorous quality assurance before delivery",
    icon: "✅",
    color: "from-green-500 to-emerald-600",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How LAUNDRIX Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Simple, transparent process from booking to delivery
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line for mobile, horizontal for desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-cyan-200 to-green-200 transform -translate-y-1/2"></div>
          <div className="md:hidden absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 via-cyan-200 to-green-200"></div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Card */}
                <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  {/* Number circle */}
                  <div
                    className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {step.number}
                  </div>

                  <div className="text-4xl mb-4 mt-2">{step.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
