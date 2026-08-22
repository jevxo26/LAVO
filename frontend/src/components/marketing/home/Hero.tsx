"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-green-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200/50 backdrop-blur-sm">
            <Package size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              Smart Laundry Management Platform
            </span>
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
        >
          <span className="block text-slate-900">Smart Laundry</span>
          <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
            Pickup & Delivery
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-8 font-medium"
        >
          Professional laundry service across Bangladesh. QR-tracked, trusted
          professionals, and secure payments.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-400/40 transition-all duration-300 group"
          >
            Book Pickup Now
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 font-semibold hover:border-blue-600 hover:bg-blue-50 transition-all duration-300"
          >
            Track Order
          </Link>
        </motion.div>

        {/* Floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative h-96 md:h-80"
        >
          {/* Card 1 - Top Left */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-0 left-0 md:left-12 w-56 md:w-64 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="text-4xl mb-2">🚚</div>
            <h3 className="font-bold text-slate-900 mb-2">Express Pickup</h3>
            <p className="text-sm text-slate-600">
              Same-day pickup service. Schedule your laundry pickup online.
            </p>
          </motion.div>

          {/* Card 2 - Center */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-56 md:w-64 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="text-4xl mb-2">📱</div>
            <h3 className="font-bold text-slate-900 mb-2">Live Tracking</h3>
            <p className="text-sm text-slate-600">
              Track your order in real-time with our QR system.
            </p>
          </motion.div>

          {/* Card 3 - Top Right */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute top-0 right-0 md:right-12 w-56 md:w-64 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-xl"
          >
            <div className="text-4xl mb-2">✨</div>
            <h3 className="font-bold text-slate-900 mb-2">Quality Care</h3>
            <p className="text-sm text-slate-600">
              Professional treatment for all fabric types. Guaranteed quality.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
