"use client";
import React, { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HomeFAQ({ data }: { data?: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const title = data?.title || "Common Questions";
  const subtitle = data?.subtitle || "Quick answers. Our full FAQ page covers everything else.";

  const faqs = data?.items?.length ? data.items : [
    {
      subtitle: "Pickup",
      title: "How does pickup scheduling work?",
      content: "You can schedule a pickup through our mobile app or website. Choose a convenient 1-hour time slot, and our delivery agent will arrive to collect your garments in our provided reusable bags.",
    },
    {
      subtitle: "Coverage",
      title: "Which cities are covered?",
      content: "We currently cover all major metropolitan areas including Dhaka, Chattogram, and Sylhet. Check our coverage map for detailed service areas.",
    },
    {
      subtitle: "Pricing",
      title: "How is pricing calculated?",
      content: "Pricing is transparent and based per item or by weight depending on the service selected. You can view full pricing in the app before confirming your order.",
    },
    {
      subtitle: "Tracking",
      title: "How does QR garment tracking work?",
      content: "Upon pickup, each item is tagged with a unique QR code. This allows you to track its exact status in real-time through the app, from cleaning to delivery.",
    },
    {
      subtitle: "Payments",
      title: "What payment methods are accepted?",
      content: "We accept all major credit/debit cards, mobile banking (bKash, Nagad), and cash on delivery.",
    },
  ];

  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-blue-50">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              FAQ
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-slate-500">
            {subtitle}
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'border-blue-200 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold whitespace-nowrap">
                    {faq.subtitle || faq.badge}
                  </span>
                  <span className="font-semibold text-slate-900">{faq.title || faq.question}</span>
                </div>
                <ChevronDown 
                  className={`text-slate-400 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={20} 
                />
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 text-sm ml-[4.5rem]">
                  {faq.content || faq.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-50 transition-colors shadow-sm">
            View All FAQs
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
