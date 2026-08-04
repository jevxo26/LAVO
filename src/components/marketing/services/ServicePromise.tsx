"use client";

import { Shield, Award, RefreshCcw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function ServicePromise({ data }: { data?: any }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const displayTitle = data?.title || "Service You Can Count On";
  const displaySubtitle = data?.subtitle || "Our Promise";

  const defaultPromises = [
    { title: "Garment Insurance", content: "Every item is insured up to $500 while in our care.", icon: Shield },
    { title: "Certified Process", content: "ISO 9001 certified cleaning across all our locations.", icon: Award },
    { title: "Satisfaction Promise", content: "Not happy? We re-clean at no additional charge.", icon: RefreshCcw }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return Shield; // Fallbacks
      case 'ShieldCheck': return Shield;
      case 'Award': return Award;
      default: return RefreshCcw;
    }
  };

  const displayPromises = (data?.items?.length ?? 0) > 0
    ? data.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      icon: getIcon(item.icon)
    }))
    : defaultPromises.map((p, i) => ({ ...p, id: i }));

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              {displaySubtitle}
            </span>
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl font-bold text-slate-900">
            {displayTitle}
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8"
        >
          {displayPromises.map((promise: any) => {
            const Icon = promise.icon;
            return (
              <motion.div
                key={promise.id}
                variants={itemAnim}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border border-border
                  bg-card
                  px-8
                  py-10
                  shadow-sm
                  transition-all
                  duration-500
                  
                  hover:-translate-y-2
                  hover:scale-[1.02]
                  hover:border-primary/20
                  hover:bg-background/80
                  hover:shadow-2xl
                  hover:shadow-primary/10
                "
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div 
                className="
                  mx-auto mb-6
                  flex h-16 w-16 items-center justify-center
                  rounded-2xl

                  bg-primary/10
                  border border-primary/10

                  text-primary

                  transition-all
                  duration-300

                  group-hover:bg-primary
                  group-hover:text-primary-foreground
                ">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {promise.title}
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  {promise.content}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
