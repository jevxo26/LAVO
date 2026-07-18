"use client";

import { Shield, Award, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";

export function ServicePromise() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-slate-100 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 mb-6 font-semibold tracking-wider text-xs uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Our Promise
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Service You Can Count On
          </h2>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8"
        >
          {/* Promise 1 */}
          <motion.div variants={item} className="flex flex-col items-center text-center bg-slate-200 py-10 rounded-2xl hover:-translate-y-2 hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 mb-6 hover:scale-110 transition-transform duration-300">
              <Shield size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Garment Insurance</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Every item is insured up to $500 while in our care.
            </p>
          </motion.div>

          {/* Promise 2 */}
          <motion.div variants={item} className="flex flex-col items-center text-center bg-slate-200 py-10 rounded-2xl hover:-translate-y-2 hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 mb-6 hover:scale-110 transition-transform duration-300">
              <Award size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Certified Process</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              ISO 9001 certified cleaning across all our locations.
            </p>
          </motion.div>

          {/* Promise 3 */}
          <motion.div variants={item} className="flex flex-col items-center text-center bg-slate-200 py-10 rounded-2xl hover:-translate-y-2 hover:scale-105">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 mb-6 hover:scale-110 transition-transform duration-300">
              <RefreshCcw size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Satisfaction Promise</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Not happy? We re-clean at no additional charge.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
