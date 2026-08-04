"use client";

import { Loader2, Sparkles, Shirt, Wallet, ShoppingBag } from "lucide-react";
import { useBooking } from "./_hooks/useBooking";
import { ServiceCard } from "./_components/ServiceCard";
import { CartSummary } from "./_components/CartSummary";
import { PickupForm } from "./_components/PickupForm";
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

  const filteredServices = services.filter((s) => s.category === activeCategory);
  const countByCategory = (cat: string) => services.filter((s) => s.category === cat).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-7 md:p-9 text-white shadow-2xl border border-indigo-800/40">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-300" />
              <span className="text-indigo-200 text-xs font-black uppercase tracking-widest">
                Express Laundry &amp; Dry Cleaning Booking
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Book Laundry Service
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium">
              Select your garments, choose specialized care treatments, and schedule doorstep collection.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[110px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Wallet Balance</p>
              <p className="text-white font-black text-xl leading-tight mt-0.5">৳{walletBalance.toFixed(2)}</p>
            </div>
            {cart.length > 0 && (
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-4 py-3 text-center min-w-[90px] shadow-inner">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Cart Items</p>
                <p className="text-white font-black text-xl leading-tight mt-0.5">{cart.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Booking Workstation Grid ──────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left: Services Selection */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:border-indigo-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                {cat}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeCategory === cat ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {countByCategory(cat)}
                </span>
              </button>
            ))}
          </div>

          {/* Services Grid */}
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
        </div>

        {/* Right: Booking Summary & Payment */}
        <div className="lg:col-span-5">
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
