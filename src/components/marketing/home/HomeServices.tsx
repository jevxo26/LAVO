"use client";

import Link from "next/link";
import { ServiceCard } from "@/components/marketing/services/ServiceCard";
import { motion } from "framer-motion";
import {
  Shirt,
  Sparkles,
  ArrowRight,
  Zap,
  ZapIcon,
  RefreshCw,
  Shield,
} from "lucide-react";

const services = [
  {
    id: "wash-fold",
    title: "Wash & Fold",
    icon: Shirt,
    price: "৳45",
    unit: "kg",
    time: "12-24 hrs",
    description: "Professional washing and neat folding for everyday garments.",
    imageUrl: "/images/home/service/servie1.png",
  },
  {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    icon: Sparkles,
    price: "৳150",
    unit: "pc",
    time: "12-24 hrs",
    description: "Expert solvent cleaning for delicate, formal, and specialty garments.",
    imageUrl: "/images/home/service/servie2.png",
  },
  {
    id: "wash-iron",
    title: "Ironing & Pressing",
    icon: ZapIcon,
    price: "৳150",
    unit: "pc",
    time: "12-24 hrs",
    description: "Expert solvent cleaning for delicate, formal, and specialty garments.",
    imageUrl: "/images/home/service/servie3.png",
  },
  {
    id: "stain-removal",
    title: "Stain Removal",
    icon: RefreshCw,
    price: "৳100",
    unit: "pc",
    time: "24-48 hrs",
    description: "Advanced treatment for stubborn stains without damaging the fabric.",
    imageUrl: "/images/home/service/servie4.png",
  },
  {
    id: "commercial-laundry",
    title: "Commercial Laundry",
    icon: Shield,
    price: "Custom",
    unit: "order",
    time: "24-48 hrs",
    description: "Bulk laundry solutions tailored for hotels, hospitals, and businesses.",
    imageUrl: "/images/home/service/servie5.png",
  },
  {
    id: "express-laundry",
    title: "Express Laundry",
    icon: Zap,
    price: "৳80",
    unit: "kg",
    time: "6-12 hrs",
    description: "Fast-tracked washing and folding services for your urgent requirements.",
    imageUrl: "/images/home/service/servie3.png",
  },
];

export function HomeServices({ data }: { data?: any }) {
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

  const title = data?.title || "Everything Your Wardrobe Needs";
  const subtitle = data?.subtitle || "From everyday wash & fold to luxury garment care — handled with professional precision and tracked in real time.";
  // const Icon = icon;
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="relative mb-12">

          {/* Center Content */}
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-blue-500 px-3 py-1 mb-4 rounded-full bg-blue-50 font-bold tracking-widest text-xs uppercase inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              Our Services
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              {title}
            </h2>

            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
          </div>

          {/* Desktop Button */}
          <div className="hidden lg:block absolute right-0 bottom-0">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold text-blue-600 hover:bg-slate-50"
            >
              View All Services
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Mobile Button */}
          <div className="flex justify-center mt-6 lg:hidden">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold text-blue-600 hover:bg-slate-50"
            >
              View All Services
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>

        {/* Services Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
        >
          {services.slice(0, 6).map((service) => (
            <motion.div key={service.id} variants={item}>
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
