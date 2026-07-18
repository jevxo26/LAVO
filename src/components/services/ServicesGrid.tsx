"use client";

import { ServiceCard } from "./ServiceCard";
import { motion } from "framer-motion";

const services = [
  {
    id: "wash-fold",
    title: "Wash & Fold",
    price: "৳45",
    unit: "kg",
    time: "12-24 hrs",
    description: "Professional washing with precision folding for everyday garments.",
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
    title: "Ironing & Press",
    price: "৳30",
    unit: "pc",
    time: "12-24 hrs",
    description: "Crisp, wrinkle-free garments finished to a professional standard.",
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

export function ServicesGrid() {
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
    <section className="w-full py-12 md:py-16 lg:py-20 bg-slate-50">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={item}>
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
