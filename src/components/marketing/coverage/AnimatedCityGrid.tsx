"use client";

import { motion } from "framer-motion";
import { CityCard } from "./CityCard";

interface CityItem {
  city: string;
  isAvailable: boolean;
}

interface AnimatedCityGridProps {
  cities: CityItem[];
}

export default function AnimatedCityGrid({
  cities,
}: AnimatedCityGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {cities.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.6,
            delay: idx * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <CityCard
            city={item.city}
            isAvailable={item.isAvailable}
          />
        </motion.div>
      ))}
    </div>
  );
}