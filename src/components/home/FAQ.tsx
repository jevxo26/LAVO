"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does the QR tracking system work?",
    answer:
      "Each order receives a unique QR code. Simply scan it with your phone to view real-time tracking information, order status, and estimated delivery time. No app download required!",
  },
  {
    question: "What is your service area?",
    answer:
      "We currently serve Dhaka and surrounding areas with 15+ branches. Check our service map to see if your location is covered. We're expanding to new areas every month!",
  },
  {
    question: "How much does the service cost?",
    answer:
      "Our pricing is transparent with no hidden fees. Prices vary based on the service type (wash only, wash+iron, dry cleaning, etc.) and quantity. You can get an instant quote on our app.",
  },
  {
    question: "What about delicate or special fabrics?",
    answer:
      "Our trained professionals are experts in handling all fabric types. We offer our Premium Care service for delicate and luxury items. Each garment is treated with specialized care.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 48-72 hours. We also offer Express delivery for urgent needs (24 hours). Delivery dates are confirmed when you book.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes! We use 256-bit SSL encryption and PCI compliance for all transactions. Your payment information is never stored on our servers.",
  },
];

export function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about LAUNDRIX
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group"
            >
              <button
                onClick={() =>
                  setExpandedIndex(expandedIndex === index ? null : index)
                }
                className="w-full text-left bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl px-6 py-4 hover:border-blue-200 hover:bg-white/80 transition-all duration-300 flex items-center justify-between"
              >
                <span className="font-semibold text-slate-900">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <ChevronDown size={20} className="text-blue-600" />
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-blue-50/50 border border-t-0 border-white/50 rounded-b-xl px-6 py-4 text-slate-700">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 mb-4">
            Didn't find your answer? Our support team is here to help!
          </p>
          <a
            href="mailto:support@laundrix.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
