"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  badgeText?: string;
  title?: string;
  description?: string;
  data?: any;
}

export function PageHero({
  badgeText,
  title,
  description,
  data,
}: PageHeroProps) {
  const displayBadge = data?.subtitle || badgeText || "Page";
  const displayTitle = data?.title || title || "Title";
  const displayDesc = data?.content || description || "";

  return (
    <section className="relative overflow-hidden border-b border-border bg-background pt-32 pb-16 md:pb-20">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-44 -right-44 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute -bottom-44 -left-44 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,.05),transparent_55%)]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}

          // animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-5 py-2"
        >
          <Sparkles className="h-4 w-4 text-primary" />

          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {displayBadge}
          </span>
        </motion.div>

        {/* Heading */}
          <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.1,
          }}
          className="mt-6 text-3xl md:text-5xl  font-black tracking-tight text-foreground"
        >
          {displayTitle}
        </motion.h1>

        {/* Description */}
        {displayDesc && (
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .2 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg"
          >
            {displayDesc}
          </motion.p>
        )}

        {/* Decorative Line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: .3 }}
          className="mx-auto mt-10 h-1 w-28 rounded-full bg-gradient-to-r from-primary to-secondary"
        />
      </div>
    </section>
  );
}