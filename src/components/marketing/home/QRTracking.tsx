"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Truck } from "lucide-react";

export function QRTracking() {
  const trackingSteps = [
    { label: "Pickup", status: "completed", icon: CheckCircle2 },
    { label: "In Transit", status: "active", icon: Loader2 },
    { label: "Delivery", status: "pending", icon: Truck },
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-r from-blue-50/50 to-cyan-50/50">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Real-Time Tracking
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Never worry about your laundry again. Scan the QR code and track
              your order in real-time from pickup to delivery.
            </p>

            {/* Features list */}
            <div className="space-y-4">
              {[
                "Instant QR code generation",
                "Live location tracking",
                "Push notifications",
                "Order history & receipts",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Tracking card demo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* QR Code mockup */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-2xl">
              {/* QR Code placeholder */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl p-4 mb-6 flex items-center justify-center h-48">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="text-xs font-medium text-slate-600">
                      QR Code
                    </div>
                  </div>
                </div>
              </div>

              {/* Order info */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-1">
                  Order #LAV-2024-5678
                </h3>
                <p className="text-sm text-slate-600">Wash + Iron Service</p>
              </div>

              {/* Tracking timeline */}
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = step.status === "completed";
                  const isActive = step.status === "active";

                  return (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-green-100"
                            : isActive
                              ? "bg-blue-100"
                              : "bg-slate-100"
                        }`}
                      >
                        <StepIcon
                          size={20}
                          className={`transition-all ${
                            isCompleted
                              ? "text-green-600"
                              : isActive
                                ? "text-blue-600 animate-spin"
                                : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="flex-grow">
                        <p
                          className={`font-medium text-sm ${
                            isCompleted || isActive
                              ? "text-slate-900"
                              : "text-slate-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {isCompleted && "Completed"}
                          {isActive && "In progress"}
                          {step.status === "pending" && "Pending"}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Estimated time */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    Estimated Delivery:
                  </span>{" "}
                  Today, 6:00 PM
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
