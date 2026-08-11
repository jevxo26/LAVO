"use client";

import React from "react";
import Link from "next/link";
import { Shirt, Award, Package, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Config ───────────────────────────────────────────────────────────────────

const GARMENT_CATEGORIES = [
  { name: "Shirts & Tops",   price: "From ৳40",  icon: Shirt,     bg: "from-blue-500 to-indigo-600"   },
  { name: "Suits & Coats",   price: "From ৳250", icon: Award,     bg: "from-purple-500 to-violet-600" },
  { name: "Bedding & Linen", price: "From ৳180", icon: Package,   bg: "from-emerald-500 to-teal-600"  },
  { name: "Curtains & Rugs", price: "From ৳350", icon: RefreshCw, bg: "from-amber-400 to-orange-500"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function GarmentCategoryCards() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-card-foreground tracking-tight">
          Book Laundry by Category
        </h2>
        <Link
          href="/dashboard/book-services"
          className="text-xs font-extrabold hover:underline flex items-center gap-1"
          style={{ color: "var(--primary)" }}
        >
          See All Services <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {GARMENT_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link key={cat.name} href="/dashboard/book-services">
              <motion.div
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-lg hover:border-ring/40 transition-all"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${cat.bg} text-white shadow-md mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={20} />
                </div>
                <p className="text-xs font-black text-card-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
                <p className="text-[11px] font-bold text-muted-foreground mt-0.5">
                  {cat.price}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
