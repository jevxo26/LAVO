"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Shirt, Wallet, ShoppingBag, Search, RotateCcw } from "lucide-react";
import { useBooking } from "./_hooks/useBooking";
import { ServiceCard } from "./_components/ServiceCard";
import { CartSummary } from "./_components/CartSummary";
import { PickupForm } from "./_components/PickupForm";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function BookLaundryPage() {
  const {
    services, categories, activeCategory, setActiveCategory,
    loading, walletBalance,
    cart, addToCart, removeFromCart, updateQuantity, toggleAddon,
    toggleWishlist,
    receiverName, setReceiverName,
    receiverPhone, setReceiverPhone,
    pickupAddress, setPickupAddress,
    pickupDate, setPickupDate,
    pickupTimeSlot, setPickupTimeSlot,
    paymentMethod, setPaymentMethod,
    subtotal, deliveryCharge, tax, grandTotal,
    submitting, handleSubmit,
    pickupLat, setPickupLat,
    pickupLon, setPickupLon,
  } = useBooking();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((s) => {
    const matchesCat = !activeCategory || activeCategory === "All" || s.category === activeCategory;
    const matchesSearch = !searchQuery.trim() ||
      s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.garmentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const allCategories = ["All", ...categories];
  const countByCategory = (cat: string) =>
    cat === "All" ? services.length : services.filter((s) => s.category === cat).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
        <p className="text-slate-400 font-bold text-xs">Loading laundry services...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7"
    >
      {/* ── 1. Executive Hero Header ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-blue-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" />
              <span className="text-cyan-200 text-xs font-black uppercase tracking-widest">
                Express Laundry &amp; Dry Cleaning Booking
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Book Laundry Service
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed font-medium">
              Select your garments, choose specialized care treatments, and schedule doorstep collection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-5 py-3 text-center min-w-[110px] shadow-inner">
              <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Wallet Credit</p>
              <p className="text-white font-black text-xl leading-tight mt-0.5">৳{walletBalance.toFixed(2)}</p>
            </div>
            {cart.length > 0 && (
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-cyan-200 text-[10px] font-black uppercase tracking-wider">Cart Items</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{cart.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Balanced Dual-Wing Workspace Layout ───────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Wing: Garment Catalog (6 Cols Wide) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laundry services (e.g. Wash &amp; Iron, Suit, Dry Clean)..."
                className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === "All" ? "" : cat)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black transition-all duration-200 ${
                    (!activeCategory && cat === "All") || activeCategory === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    (!activeCategory && cat === "All") || activeCategory === cat
                      ? "bg-white/25 text-white"
                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
                  }`}>
                    {countByCategory(cat)}
                  </span>
                </button>
              ))}

              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => { setSearchQuery(""); setActiveCategory(""); }}
                  className="h-9 px-3 rounded-xl text-xs font-black text-slate-500 hover:text-rose-600 gap-1.5 ml-auto"
                >
                  <RotateCcw size={13} /> Clear
                </Button>
              )}
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center dark:bg-slate-900 dark:border-slate-800">
              <p className="text-sm font-black text-slate-900 dark:text-white">No services found</p>
              <p className="mt-1 text-xs text-slate-400 font-medium">Try clearing your search query or choosing another category.</p>
              <Button onClick={() => { setSearchQuery(""); setActiveCategory(""); }} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-black gap-1.5 border-slate-200">
                <RotateCcw size={13} /> Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  inCart={cart.some((i) => i.service.id === service.id)}
                  onAdd={addToCart}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Wing: Booking & Checkout Studio Card (6 Cols Wide) */}
        <div className="lg:col-span-6">
          <div className="sticky top-6">
            <form onSubmit={handleSubmit}>
              <CartSummary
                cart={cart}
                walletBalance={walletBalance}
                paymentMethod={paymentMethod}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                tax={tax}
                grandTotal={grandTotal}
                submitting={submitting}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onToggleAddon={toggleAddon}
                onPaymentMethodChange={setPaymentMethod}
              >
                <PickupForm
                  receiverName={receiverName}
                  receiverPhone={receiverPhone}
                  pickupAddress={pickupAddress}
                  pickupDate={pickupDate}
                  pickupTimeSlot={pickupTimeSlot}
                  onReceiverNameChange={setReceiverName}
                  onReceiverPhoneChange={setReceiverPhone}
                  onPickupAddressChange={setPickupAddress}
                  onPickupLatChange={setPickupLat}
                  onPickupLonChange={setPickupLon}
                  onPickupDateChange={setPickupDate}
                  onPickupTimeSlotChange={setPickupTimeSlot}
                />
              </CartSummary>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
