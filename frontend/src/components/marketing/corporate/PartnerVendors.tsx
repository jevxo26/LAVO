"use client";

import { motion } from "framer-motion";
import { LocationCard } from "./LocationCard";

type VendorItem = {
  name: string;
  city: string;
  address: string | null;
  hours: string;
  phone: string;
};

type PartnerVendorsProps = {
  vendors: VendorItem[];
};

export default function PartnerVendors({
  vendors,
}: PartnerVendorsProps) {
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-surface-light">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {vendors.map((vendor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.8,
                delay: idx * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <LocationCard
                name={vendor.name}
                city={vendor.city}
                address={vendor.address || ""}
                phone={vendor.phone}
                hours={vendor.hours}
                isVendor={true}
              />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}