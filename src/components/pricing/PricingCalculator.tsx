"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Minus, Plus, Calendar } from "lucide-react";

const garments = [
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

const services = [
  { name: "Wash Only", addOn: 0 },
  { name: "Wash & Fold", addOn: 10 },
  { name: "Wash & Iron", addOn: 25 },
  { name: "Dry Cleaning", addOn: 100 },
  { name: "Steam Iron", addOn: 30 },
  { name: "Premium Care", addOn: 80 },
  { name: "Stain Removal", addOn: 50 },
  { name: "Delicate Care", addOn: 60 },
];

const turnarounds = [
  { name: "Standard (48 hrs)", multiplier: 1 },
  { name: "Express (24 hrs)", multiplier: 1.5 },
  { name: "Same Day (12 hrs)", multiplier: 2 },
];

export function PricingCalculator() {
  const [selectedGarment, setSelectedGarment] = useState(garments[2]); // Default Pants
  const [selectedService, setSelectedService] = useState(services[1]); // Default Wash & Fold
  const [quantity, setQuantity] = useState(5);
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

  const calculateTotal = () => {
    const base = selectedGarment.basePrice;
    const extra = selectedService.addOn;
    const qty = quantity;
    const multiplier = selectedTurnaround.multiplier;
    return Math.round(((base + extra) * qty) * multiplier);
  };

  const total = calculateTotal();

  return (
    <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        
        {/* Title Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 mb-6 font-semibold tracking-wider text-xs uppercase">
            LIVE PRICING
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Know your pricing before you book
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto">
            Transparent pricing. No surprises at delivery.
          </p>
        </motion.div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
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
                    className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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
                    className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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
                <div className="flex items-center justify-between border border-slate-200 rounded-2xl px-3 py-2.5">
                  <button onClick={decrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-bold text-slate-900 w-16 text-center">
                    {quantity}
                  </span>
                  <button onClick={incrementQuantity} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 border border-slate-100 text-slate-600 transition-colors">
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
                    className="w-full appearance-none bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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
            className="lg:col-span-5 bg-[#171f38] text-white rounded-[2rem] p-8 shadow-xl"
          >
            <h3 className="text-lg font-bold tracking-wide uppercase mb-6 text-white/90">Estimated Price</h3>
            
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center mb-6 shadow-lg shadow-blue-500/20">
              <span className="block text-blue-100 text-sm font-medium mb-1">Estimated Total</span>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                ৳ {total}
              </div>
              <span className="block text-blue-100/80 text-xs font-medium">incl. pickup & delivery</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Service</span>
                <span className="block text-white font-semibold text-sm truncate">{selectedService.name}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Delivery</span>
                <span className="block text-white font-semibold text-sm truncate">{selectedTurnaround.name.split(' (')[1].replace(')', '')}</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Pickup</span>
                <span className="block text-white font-semibold text-sm">Free</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="block text-slate-400 text-xs mb-1 font-medium">Payment</span>
                <span className="block text-white font-semibold text-sm">On delivery</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/25">
              <Calendar size={18} />
              Book Pickup at ৳ {total}
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
