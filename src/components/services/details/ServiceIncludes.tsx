"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceIncludesProps {
  includes: string[];
}

export function ServiceIncludes({ includes }: ServiceIncludesProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-2xl md:text-3xl font-bold text-slate-900 mb-10"
        >
          What's Included
        </motion.h2>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {includes.map((includeItem, idx) => (
            <motion.div 
              key={idx}
              variants={item}
              className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="text-emerald-500">
                <Check size={18} strokeWidth={3} />
              </div>
              <span className="text-slate-800 font-semibold text-sm">{includeItem}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
