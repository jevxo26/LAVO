"use client";

import { motion } from "framer-motion";
import { CorporateQuoteForm } from "@/components/marketing/corporate/CorporateQuoteForm";

import {
  Building2,
  Box,
  RefreshCw,
  Mail,
  ShieldCheck,
  Zap,
  Users,
  Shield,
  Globe,
  Activity,
  Star,
} from "lucide-react";

const businessFeatures = [
  {
    title: "Dedicated Account Manager",
    description:
      "A single point of contact for all your laundry operations.",
    icon: Building2,
  },
  {
    title: "Flexible Volume Pricing",
    description:
      "Tiered pricing that scales proportionally with your weekly volume.",
    icon: Box,
  },
  {
    title: "Recurring Pickup Schedule",
    description:
      "Fixed pickup days and times that fit your operational rhythm.",
    icon: RefreshCw,
  },
  {
    title: "Consolidated Invoicing",
    description:
      "One weekly or monthly invoice with full line-item detail.",
    icon: Mail,
  },
  {
    title: "Full Liability Coverage",
    description:
      "All corporate items insured against damage or loss.",
    icon: ShieldCheck,
  },
  {
    title: "Express Priority Lane",
    description:
      "Jump the queue with guaranteed same-day processing for urgent items.",
    icon: Zap,
  },
];

const industries = [
  {
    title: "Hotels & Resorts",
    description: "Linens, towels, uniforms",
    icon: Building2,
  },
  {
    title: "Restaurants",
    description: "Table linens, chef whites",
    icon: Users,
  },
  {
    title: "Healthcare",
    description: "Scrubs, lab coats",
    icon: Shield,
  },
  {
    title: "Corporate Offices",
    description: "Dry cleaning accounts",
    icon: Globe,
  },
  {
    title: "Gyms & Spas",
    description: "Towels, robes, mats",
    icon: Activity,
  },
  {
    title: "Film & Media",
    description: "Costume care, wardrobe",
    icon: Star,
  },
];

type CorporateContentProps = {
  featuresSection: {
    title?: string | null;
    content?: string | null;
  } | null;
};

export default function CorporateContent({
  featuresSection,
}: CorporateContentProps) {
  return (
    <section className="w-full py-16 lg:py-24 bg-surface-light">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">

        {/* Main Two Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              {featuresSection?.title || "Built for Business Scale"}
            </h2>

            <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-lg">
              {featuresSection?.content ||
                "LAUNDRIX Corporate provides volume pricing, dedicated account management, flexible pickup schedules, and consolidated invoicing."}
            </p>

            <div className="flex flex-col gap-8">
              {businessFeatures.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={idx}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        {feature.title}
                      </h4>

                      <p className="text-sm text-slate-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Industries We Serve
            </h2>

            <p className="text-slate-500 mb-8 text-sm">
              Tailored solutions for every industry vertical.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {industries.map((industry, idx) => {
                const Icon = industry.icon;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Icon
                      size={20}
                      className="text-blue-500 mb-3"
                    />

                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {industry.title}
                    </h4>

                    <p className="text-xs text-slate-400">
                      {industry.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  2K+
                </div>

                <div className="text-[10px] text-slate-500">
                  Items/week capacity
                </div>
              </div>

              <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  200+
                </div>

                <div className="text-[10px] text-slate-500">
                  Corporate clients
                </div>
              </div>

              <div className="bg-blue-100/80 rounded-2xl p-5 border border-blue-100/50 text-center flex flex-col justify-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  99%
                </div>

                <div className="text-[10px] text-slate-500">
                  On-time delivery
                </div>
              </div>
            </div>
          </motion.div>

        </div>
        {/* Quote Form */}
        <CorporateQuoteForm />

      </div>
    </section>
  );
}