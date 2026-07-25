"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useBooking } from "./_hooks/useBooking";
import { ServiceCard } from "./_components/ServiceCard";
import { CartSummary } from "./_components/CartSummary";
import { PickupForm } from "./_components/PickupForm";

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
  } = useBooking();

  const filteredServices = services.filter((s) => s.category === activeCategory);
  const countByCategory = (cat: string) => services.filter((s) => s.category === cat).length;

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
          <Loader2 size={28} className="text-indigo-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-medium text-sm">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 px-8 py-10 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-10 translate-y-10" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-200" />
              <span className="text-indigo-200 text-xs font-semibold uppercase tracking-widest">
                Premium Service
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Book Laundry Services
            </h1>
            <p className="text-indigo-200 mt-1.5 text-sm">
              Pick your garments, add treatments, and schedule home collection.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
              <p className="text-indigo-200 text-xs font-medium">Wallet Balance</p>
              <p className="text-white font-extrabold text-lg">৳{walletBalance.toFixed(2)}</p>
            </div>
            {cart.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center border border-white/20">
                <p className="text-indigo-200 text-xs font-medium">Items in Cart</p>
                <p className="text-white font-extrabold text-lg">{cart.length}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left: Services */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {cat}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                  activeCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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

        {/* Right: Booking Summary */}
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
                  onPickupDateChange={setPickupDate}
                  onPickupTimeSlotChange={setPickupTimeSlot}
                />
              </CartSummary>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
