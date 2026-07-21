"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ServiceDetailsHeroProps {
  title: string;
  isPremium: boolean;
  description: string;
  startingPrice: string;
  turnaround: string;
  coverage: string;
  imageUrl: string;
}

export function ServiceDetailsHero({
  title,
  isPremium,
  description,
  startingPrice,
  turnaround,
  coverage,
  imageUrl,
}: ServiceDetailsHeroProps) {
  return (
    <section className="w-full pt-32 pb-12 md:pb-16 lg:pb-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            <Link 
              href="/services"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors text-sm font-semibold mb-8"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Link>

            {isPremium && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-100 text-purple-600 mb-6 font-bold tracking-wider text-[10px] uppercase w-fit">
                <Sparkles size={12} />
                Premium Service
              </div>
            )}

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              {title}
            </h1>
            
            <p className="text-slate-600 text-base md:text-lg mb-10 max-w-lg leading-relaxed">
              {description}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 mb-1">Starting From</span>
                <span className="text-slate-900 font-bold">{startingPrice}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 mb-1">Turnaround</span>
                <span className="text-slate-900 font-bold">{turnaround}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400 mb-1">Coverage</span>
                <span className="text-slate-900 font-bold">{coverage}</span>
              </div>
            </div>

            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm transition-all shadow-md shadow-blue-500/20 w-fit group">
              Schedule Pickup
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
