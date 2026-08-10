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
<section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30 pt-28 pb-24 lg:pt-32 lg:pb-28">

    {/* Background */}
    <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
    </div>
    <div className="relative mx-auto max-w-[1380px] px-4 md:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex max-w-xl flex-col"
          >
            <Link 
              href="/services"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold mb-8"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Link>
            {isPremium && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/15 mb-6 font-bold tracking-wider text-[10px] uppercase w-fit">
                <Sparkles size={12} />
                Premium Service
              </div>
            )}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-6">
              {title}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-lg leading-relaxed">
              {description}
            </p>
            <div className="mb-8 grid grid-cols-3 gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground mb-1">Starting From</span>
                <span className="text-foreground font-bold">{startingPrice}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground mb-1">Turnaround</span>
                <span className="text-foreground font-bold">{turnaround}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground mb-1">Coverage</span>
                <span className="text-foreground font-bold">{coverage}</span>
              </div>
            </div>
            <Link href={`/pricing?service=${encodeURIComponent(title)}`} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-full font-semibold text-sm transition-all shadow-md shadow-blue-500/20 w-fit group">
              Schedule Pickup for {title}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Right Side: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[240px] overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:h-[420px] lg:h-[500px]"
          >
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover object-center transition-transform duration-700 hover:scale-105"
              sizes="(max-width:768px)100vw,(max-width:1024px)50vw,620px"
              priority
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
