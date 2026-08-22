"use client";

import { ServiceCard } from "./ServiceCard";
import { motion } from "framer-motion";
import { serviceDetails } from "@/data/servicesDetails";


export function ServicesGrid({ data }: { data?: any }) {
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


  const services = Object.values(serviceDetails).map((service) => {
    const [price, unit] = service.startingPrice.split("/");

    return {
      ...service,
      price,
      unit: unit || "",
      time: service.turnaround,
    };
  });
  const displayServices =
    (data?.items?.length ?? 0) > 0
      ? data.items.map((item: any) => {
        const slug =
          item.link?.replace(/^\/services\//, "") ||
          item.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const service = services.find((s) => s.id === slug);

        return {
          ...service,

          // CMS data
          id: slug,
          title: item.title || service?.title,
          imageUrl: item.image || service?.imageUrl,

          // Frontend service details
          description: service?.description || item.content,
          price: service?.price || "",
          unit: service?.unit || "",
          time: service?.time || "",
        };
      })
      : services;

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-surface-light">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8"
        >
          {displayServices.map((service: any) => (
            <motion.div key={service.id} variants={itemAnim}>
              <ServiceCard {...service} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
