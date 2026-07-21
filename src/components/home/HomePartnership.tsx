"use client";

import React from "react";
import { Store, Building, Truck, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HomePartnership({ data }: { data?: any }) {
  const title = data?.title || "Grow your business with LAUNDRIX";
  const subtitle = data?.subtitle || "Join our partner network and access thousands of orders, powerful dashboard tools, and reliable weekly payouts.";
  
  const partners = data?.items?.length ? data.items : [
    {
      icon: Store,
      iconBg: "bg-blue-600",
      title: "Laundry Partner",
      desc: "Own a laundry facility? Receive a steady stream of orders from our platform.",
      perks: [
        "Guaranteed daily orders",
        "Order management dashboard",
        "Weekly payout",
        "Free onboarding support"
      ]
    },
    {
      icon: Building,
      iconBg: "bg-purple-600",
      title: "Branch Partner",
      desc: "Operate a collection point and manage pickups with full LAUNDRIX support.",
      perks: [
        "Territorial exclusivity",
        "Branch management system",
        "Training provided",
        "Revenue sharing model"
      ]
    },
    {
      icon: Truck,
      iconBg: "bg-emerald-600",
      title: "Delivery Partner",
      desc: "Join our rider network and earn by delivering clean laundry across your city.",
      perks: [
        "Flexible working hours",
        "Route optimisation app",
        "Daily earnings",
        "Performance bonuses"
      ]
    },
    {
      icon: () => <span className="font-bold text-lg leading-none">🧑‍💼</span>,
      iconBg: "bg-orange-500",
      title: "Pickup Agent",
      desc: "Become a LAUNDRIX agent in your neighbourhood and earn commission per pickup.",
      perks: [
        "Walk-in bookings",
        "Agent mobile app",
        "Commission per order",
        "Growth opportunity"
      ]
    }
  ];

  return (
    <section className="bg-surface-light py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-blue-50">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">
              Partnerships
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
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

              <button className="flex items-center justify-center gap-2 bg-brand-sky hover:bg-brand-sky-hover text-white w-full py-3 rounded-xl font-semibold transition-colors mt-auto shadow-sm">
                Apply Now
                <ArrowRight size={16} />
              </button>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
