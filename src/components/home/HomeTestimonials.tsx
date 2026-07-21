"use client";

import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

export function HomeTestimonials({ data }: { data?: any }) {
  const title = data?.title || "What Our Customers Say";
  
  const testimonials = data?.items?.length ? data.items : [
    {
      name: "Sarah Mitchell",
      role: "Marketing Manager · TechCorp Inc.",
      content: "\"LAUNDRIX changed my morning routine entirely. QR tracking is brilliant — I always know exactly where my dry cleaning is in real time.\"",
      subtitle: "SM",
    },
    {
      name: "James Thompson",
      role: "Restaurant Owner · Bistro 45",
      content: "\"We use LAUNDRIX for all our staff uniforms. Bulk pricing is excellent and quality is consistently outstanding every week.\"",
      subtitle: "JT",
    },
    {
      name: "Priya Sharma",
      role: "Healthcare Professional · City Medical",
      content: "\"Reliable, professional, perfectly cleaned every time. I wouldn't trust anyone else with my scrubs. Peace of mind is invaluable.\"",
      subtitle: "PS",
    },
    {
      name: "Marcus Reid",
      role: "Hotel Manager · Grand Palace",
      content: "\"Running a 200-room hotel means we need reliable service every day. LAUNDRIX delivers without exception. Our guests always notice.\"",
      subtitle: "MR",
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
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            {title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t: any, idx: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col h-full"
            >
              <div className="flex text-yellow-400 mb-6 gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-amber-star" />
                ))}
              </div>
              <p className="text-slate-600 mb-8 flex-grow leading-relaxed text-sm">
                {t.content || t.text}
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {t.subtitle || t.initials}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t.name || t.title}</h4>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
