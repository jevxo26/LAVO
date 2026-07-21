"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { motion } from "framer-motion";

const services = [
  {
    id: "wash-fold",
    title: "Wash & Fold",
    price: "৳45",
    unit: "kg",
    time: "12-24 hrs",
    description: "Professional washing and neat folding for everyday garments.",
    imageUrl: "https://images.unsplash.com/photo-1582735689141-c11bb356c6d5?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dry-cleaning",
    title: "Dry Cleaning",
    price: "৳150",
    unit: "pc",
    time: "12-24 hrs",
    description: "Expert solvent cleaning for delicate, formal, and specialty garments.",
    imageUrl: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "wash-iron",
    title: "Ironing & Pressing",
    price: "৳150",
    unit: "pc",
    time: "12-24 hrs",
    description: "Expert solvent cleaning for delicate, formal, and specialty garments.",
    imageUrl: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "stain-removal",
    title: "Stain Removal",
    price: "৳100",
    unit: "pc",
    time: "24-48 hrs",
    description: "Advanced treatment for stubborn stains without damaging the fabric.",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "commercial-laundry",
    title: "Commercial Laundry",
    price: "Custom",
    unit: "order",
    time: "24-48 hrs",
    description: "Bulk laundry solutions tailored for hotels, hospitals, and businesses.",
    imageUrl: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "express-laundry",
    title: "Express Laundry",
    price: "৳80",
    unit: "kg",
    time: "6-12 hrs",
    description: "Fast-tracked washing and folding services for your urgent requirements.",
    imageUrl: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&q=80&w=800",
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

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0 flex flex-col items-center md:items-start">
            <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-3 flex items-center justify-center md:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              Our Services
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">{title}</h2>
            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <Link href="/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-sm font-semibold text-blue-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
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
