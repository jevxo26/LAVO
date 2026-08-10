"use client";

import React from "react";
import { Store, Building, Truck, Check, ArrowRight, Building2, User, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HomePartnership({ data }: { data?: any }) {
  const title = data?.title || "Grow your business with LAUNDRIX";
  const subtitle = data?.subtitle || "Join our partner network and access thousands of orders, powerful dashboard tools, and reliable weekly payouts.";

  const defaultPartners = [
    {
      title: "Laundry Partner",
      icon: Store,
      iconBg: "bg-blue-600",
      desc: "Own a laundry facility? Receive a steady stream of orders from our platform.",
      perks: [
        "Guaranteed daily orders",
        "Order management dashboard",
        "Weekly payout",
        "Free onboarding support",
      ],
    },
    {
      title: "Branch Partner",
      icon: Building2,
      iconBg: "bg-purple-600",
      desc: "Operate a collection point and manage pickups with full LAUNDRIX support.",
      perks: [
        "Territorial exclusivity",
        "Branch management system",
        "Training provided",
        "Revenue sharing model",
      ],
    },
    {
      title: "Delivery Partner",
      icon: Truck,
      iconBg: "bg-emerald-600",
      desc: "Join our rider network and earn by delivering clean laundry across your city.",
      perks: [
        "Flexible working hours",
        "Route optimisation app",
        "Daily earnings",
        "Performance bonuses",
      ],
    },
    {
      title: "Pickup Agent",
      icon: User,
      iconBg: "bg-orange-500",
      desc: "Become a LAUNDRIX agent in your neighbourhood and earn commission per pickup.",
      perks: [
        "Walk-in bookings",
        "Agent mobile app",
        "Commission per order",
        "Growth opportunity",
      ],
    },
  ];

  const partners = data?.items?.length
    ? data.items.map((item: any) => {
      const defaultPartner = defaultPartners.find(
        (p) => p.title === item.title
      );

      return {
        ...defaultPartner,
        ...item,
        icon: defaultPartner?.icon,
        iconBg: item.subtitle || defaultPartner?.iconBg,
        desc: item.content || defaultPartner?.desc,
      };
    })
    : defaultPartners;
  console.log(partners);

  return (
    <section className="bg-surface-light py-12 md:py-16 lg:py-20">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
            <Handshake className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Partnerships
            </span>
          </div>
          <h2 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner: any, idx: number) => {
            const Icon = partner.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-2xl ${partner.iconBg || 'bg-blue-600'} flex items-center justify-center text-white mb-6 shrink-0`}>
                  {Icon ? (typeof Icon === 'string' ? <span>{Icon}</span> : <Icon size={24} />) : <Store size={24} />}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{partner.title || partner.name}</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed h-16">
                  {partner.desc}
                </p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {(partner.perks || []).map((perk: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <Link href={'/partner'} className="flex items-center justify-center gap-2 bg-gradient-to-l from-blue-400 to-blue-500 text-white rounded-xl font-semibold hover:bg-brand-sky-hover w-full py-3 rounded-xl font-semibold transition-colors mt-auto shadow-sm">
                  Apply Now
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
