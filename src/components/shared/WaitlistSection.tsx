"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function WaitlistSection() {
  return (
    <section className="w-full py-16 md:py-20 bg-[#0f172a] text-white">
      <div className="max-w-xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 mb-6">
            <Globe size={24} />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Don't see your city?
          </h2>
          
          <p className="text-slate-400 text-sm mb-8">
            Join our waitlist and we'll notify you the moment LAUNDRIX launches near you.
          </p>

          <form className="w-full flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit"
              className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm px-8 py-3 rounded-full transition-colors whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
