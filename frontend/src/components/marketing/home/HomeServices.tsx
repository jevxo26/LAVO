"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { ServiceCard } from "@/components/marketing/services/ServiceCard";
import { serviceDetails } from "@/data/servicesDetails";

export function HomeServices({ data }: { data?: any }) {
  const services = Object.values(serviceDetails).map((service) => {
    const [price, unit] = service.startingPrice.split("/");

    return {
      ...service,
      price,
      unit: unit || "",
      time: service.turnaround,
    };
  });

  const title =
    data?.title || "Everything Your Wardrobe Needs";

  const subtitle =
    data?.subtitle ||
    "From everyday wash & fold to luxury garment care — handled with professional precision and tracked in real time.";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 25,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
      },
    },
  };

  return (
    <section className="bg-background  py-12 md:py-16 lg:py-20">
      <div className="container max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-14">
          {/* Center Content */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Our Services
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
              {title}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {subtitle}
            </p>

          </div>

          {/* Desktop Button */}
          <div className="absolute right-0 -bottom-6 hidden lg:block">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg"
            >
              View All Services
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          {/* Mobile / Tablet Button */}
          <div className="mt-8 flex justify-center lg:hidden">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg"
            >
              View All Services
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="
          grid
          grid-cols-1
          gap-6
          sm:grid-cols-2
          lg:grid-cols-4
          xl:grid-cols-4
        "
        >
          {services.slice(0, 4).map((service) => (
            <motion.div
              key={service.id}
              variants={item}
              className="flex h-full"
            >
              <div className="w-full">
                <ServiceCard {...service} />
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}