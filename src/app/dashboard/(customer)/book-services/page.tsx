"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, Shirt, Wallet, ShoppingBag, Search, RotateCcw, Filter } from "lucide-react";
import { useBooking } from "./_hooks/useBooking";
import { ServiceCatalogGrid } from "./_components/ServiceCatalogGrid";
import { FloatingCartBar } from "./_components/FloatingCartBar";
import { CheckoutModal } from "./_components/CheckoutModal";
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
        <p className="text-slate-400 font-bold text-xs">Loading laundry catalog...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-7 pb-20"
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
                Premium Garment Care &amp; Booking Studio
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Book Laundry &amp; Dry Cleaning
            </h1>
            <p className="text-indigo-100 text-xs md:text-sm leading-relaxed font-medium">
              Browse our complete laundry catalog, select specialized care treatments, and schedule doorstep pickup.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl px-5 py-3 text-center min-w-[110px] shadow-inner">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-wider">Wallet Credit</p>
              <p className="text-white font-black text-xl leading-tight mt-0.5">৳{walletBalance.toFixed(2)}</p>
            </div>
            {cart.length > 0 && (
              <Button
                onClick={() => setIsCheckoutOpen(true)}
                className="h-11 px-5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-black text-xs shadow-lg gap-2 transition-all hover:scale-[1.02]"
              >
                <ShoppingBag size={16} /> View Bag ({cart.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Toolbar & Category Filters ────────────────────────────────────── */}
      <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="relative max-w-lg">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search garments &amp; services (e.g. Wash &amp; Iron, Suit, Dry Clean)..."
            className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === "All" ? "" : cat)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black transition-all duration-200 rounded-2xl ${
                (!activeCategory && cat === "All") || activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
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
              <RotateCcw size={13} /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── 3. 3-Column Visual Garment Catalog Grid ───────────────────────────── */}
      {filteredServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center dark:bg-slate-900 dark:border-slate-800">
          <p className="text-base font-black text-slate-900 dark:text-white">No laundry services match your search</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Try searching for other garment types or clear filters.</p>
          <Button onClick={() => { setSearchQuery(""); setActiveCategory(""); }} variant="outline" className="mt-4 h-9 px-4 rounded-xl text-xs font-black gap-1.5 border-slate-200">
            <RotateCcw size={13} /> Reset Catalog Search
          </Button>
        </div>
      ) : (
        <ServiceCatalogGrid
          services={filteredServices}
          cart={cart}
          onAddToCart={addToCart}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onToggleAddon={toggleAddon}
          onToggleWishlist={toggleWishlist}
        />
      )}

      {/* ── 4. Floating Smart Cart Bar (Appears when cart has items) ──────────── */}
      <FloatingCartBar
        totalItems={cart.length}
        grandTotal={grandTotal}
        subtotal={subtotal}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* ── 5. Express Checkout Modal ────────────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <CheckoutModal
          open={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
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
        </CheckoutModal>
      </form>
    </motion.div>
  );
}
