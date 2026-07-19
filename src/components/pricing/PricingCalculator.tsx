"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

// ─── Hardcoded fallback data ──────────────────────────────────────────────────

const DEFAULT_GARMENTS = [
  { name: "Shirts", basePrice: 40 },
  { name: "T-Shirts", basePrice: 30 },
  { name: "Pants", basePrice: 45 },
  { name: "Jeans", basePrice: 50 },
  { name: "Suits", basePrice: 200 },
  { name: "Blazers", basePrice: 150 },
  { name: "Sarees", basePrice: 120 },
  { name: "Punjabis", basePrice: 80 },
  { name: "Jackets", basePrice: 180 },
  { name: "Sweaters", basePrice: 100 },
  { name: "Blankets", basePrice: 250 },
  { name: "Bedsheets", basePrice: 80 },
  { name: "Curtains", basePrice: 150 },
  { name: "Carpets", basePrice: 500 },
  { name: "Sofa Covers", basePrice: 300 },
  { name: "Pillows", basePrice: 60 },
  { name: "Shoes", basePrice: 350 },
];

const DEFAULT_SERVICES = [
  { name: "Wash Only", addOn: 0 },
  { name: "Wash & Fold", addOn: 10 },
  { name: "Wash & Iron", addOn: 25 },
  { name: "Dry Cleaning", addOn: 100 },
  { name: "Steam Iron", addOn: 30 },
  { name: "Premium Care", addOn: 80 },
  { name: "Stain Removal", addOn: 50 },
  { name: "Delicate Care", addOn: 60 },
];

const DEFAULT_TURNAROUNDS = [
  { name: "Standard (48 hrs)", multiplier: 1 },
  { name: "Express (24 hrs)", multiplier: 1.5 },
  { name: "Same Day (12 hrs)", multiplier: 2 },
];

const DEFAULT_ADDONS = [
  { name: "Shirt", price: 45 },
  { name: "Trousers", price: 40 },
  { name: "Suit (2-piece)", price: 80 },
  { name: "Dress", price: 40 },
  { name: "Coat", price: 100 },
  { name: "King Bedsheet", price: 100 },
  { name: "Duvet Cover", price: 70 },
  { name: "Towel", price: 60 },
  { name: "Stain Removal", price: 45 },
  { name: "Express Pressing", price: 40 },
  { name: "Fabric Softener Upgrade", price: 80 },
  { name: "Hanger Return", price: 40 },
  { name: "Premium Packaging", price: 100 },
  { name: "Scent Selection", price: 100 },
  { name: "Hypoallergenic Detergent", price: 70 },
  { name: "Re-Fold Service", price: 60 },
];

// ─── CMS data parser ──────────────────────────────────────────────────────────

type CmsItem = {
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  displayOrder?: number;
};

function parsePricingData(items: CmsItem[]) {
  const garments = items
    .filter((i) => i.subtitle === "garment" && i.title)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((i) => ({ name: i.title!, basePrice: parseFloat(i.content ?? "0") || 0 }));

  const services = items
    .filter((i) => i.subtitle === "service" && i.title)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((i) => ({ name: i.title!, addOn: parseFloat(i.content ?? "0") || 0 }));

  const turnarounds = items
    .filter((i) => i.subtitle === "turnaround" && i.title)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((i) => ({ name: i.title!, multiplier: parseFloat(i.content ?? "1") || 1 }));

  const addons = items
    .filter((i) => i.subtitle === "addon" && i.title)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((i) => ({ name: i.title!, price: parseFloat(i.content ?? "0") || 0 }));

  return { garments, services, turnarounds, addons };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingCalculator({ data }: { data?: any }) {
  // Parse CMS data, falling back to hardcoded defaults per category
  const cmsItems: CmsItem[] = data?.items ?? [];
  const parsed = parsePricingData(cmsItems);

  const garments    = parsed.garments.length    ? parsed.garments    : DEFAULT_GARMENTS;
  const services    = parsed.services.length    ? parsed.services    : DEFAULT_SERVICES;
  const turnarounds = parsed.turnarounds.length ? parsed.turnarounds : DEFAULT_TURNAROUNDS;
  const addons      = parsed.addons.length      ? parsed.addons      : DEFAULT_ADDONS;

  const [selectedGarment, setSelectedGarment]     = useState(garments[2] ?? garments[0]);
  const [selectedService, setSelectedService]     = useState(services[1] ?? services[0]);
  const [quantity, setQuantity]                   = useState(5);
  const [selectedTurnaround, setSelectedTurnaround] = useState(turnarounds[0]);

  const handleGarmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const garment = garments.find((g) => g.name === e.target.value);
    if (garment) setSelectedGarment(garment);
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = services.find((s) => s.name === e.target.value);
    if (service) setSelectedService(service);
  };

  const handleTurnaroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ta = turnarounds.find((t) => t.name === e.target.value);
    if (ta) setSelectedTurnaround(ta);
  };

  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));
  const incrementQuantity = () => setQuantity((prev) => prev + 1);

  const total = Math.round(
    ((selectedGarment.basePrice + selectedService.addOn) * quantity) * selectedTurnaround.multiplier
  );

  // Safe delivery label — handles turnaround names that may not have the "(xx hrs)" pattern
  const deliveryLabel = (() => {
    const match = selectedTurnaround.name.match(/\(([^)]+)\)/);
    return match ? match[1] : selectedTurnaround.name;
  })();

  return (
    <section className="w-full pb-16 bg-transparent">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">

          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">

              {/* Select Garment */}
              <div className="flex flex-col gap-3">
                <label className="text-lg font-bold text-slate-900">Select Garment</label>
                <div className="relative">
                  <select
                    value={selectedGarment.name}
                    onChange={handleGarmentChange}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {garments.map((g) => (
                      <option key={g.name} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Select Service */}
              <div className="flex flex-col gap-3">
                <label className="text-lg font-bold text-slate-900">Select Service</label>
                <div className="relative">
                  <select
                    value={selectedService.name}
                    onChange={handleServiceChange}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-3">
                <label className="text-lg font-bold text-slate-900">Quantity</label>
                <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2">
                  <button onClick={decrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="text-xl font-bold text-slate-900 w-16 text-center">
                    {quantity}
                  </span>
                  <button onClick={incrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Turnaround */}
              <div className="flex flex-col gap-3">
                <label className="text-lg font-bold text-slate-900">Turnaround</label>
                <div className="relative">
                  <select
                    value={selectedTurnaround.name}
                    onChange={handleTurnaroundChange}
                    className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                  >
                    {turnarounds.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* Right Side: Result Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 bg-[#0B101E] text-white rounded-[24px] p-8 shadow-xl border border-slate-800"
          >
            <h3 className="text-lg font-bold tracking-wide uppercase mb-6 text-white">ESTIMATED PRICE</h3>

            <div className="bg-[#1f5df9] rounded-2xl p-6 text-center mb-6">
              <span className="block text-blue-100 text-xs font-medium mb-1">Estimated Total</span>
              <div className="text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight">
                ৳ {total}
              </div>
              <span className="block text-blue-100/80 text-[10px] font-medium">incl. pickup & delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#2A3143]/50 border border-white/5 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Service</span>
                <span className="block text-white font-semibold text-sm truncate">{selectedService.name}</span>
              </div>
              <div className="bg-[#2A3143]/50 border border-white/5 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Delivery</span>
                <span className="block text-white font-semibold text-sm truncate">{deliveryLabel}</span>
              </div>
              <div className="bg-[#2A3143]/50 border border-white/5 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Pickup</span>
                <span className="block text-white font-semibold text-sm">Free</span>
              </div>
              <div className="bg-[#2A3143]/50 border border-white/5 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Payment</span>
                <span className="block text-white font-semibold text-sm">On delivery</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-[#1f5df9] hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors">
              Schedule Pickup ৳ {total}
            </button>
          </motion.div>

        </div>

        {/* Add-ons Section */}
        <div className="mt-16 border-t border-slate-100 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mb-10"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 mb-4 font-bold tracking-widest text-[10px] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2"></span>
              ADD-ONS
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Customise Your Order
            </h2>
            <p className="text-slate-500 text-sm">
              Enhance any base plan with premium extras.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
          >
            {addons.map((addon, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-default"
              >
                <span className="text-sm font-semibold text-slate-700">{addon.name}</span>
                <span className="text-sm font-bold text-blue-600">৳{addon.price}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
