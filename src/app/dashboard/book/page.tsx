"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Shirt, 
  Trash2, 
  MapPin, 
  Calendar as CalendarIcon, 
  Clock, 
  Wallet, 
  CreditCard,
  Plus,
  Minus,
  Sparkles,
  Heart,
  Loader2
} from "lucide-react";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

interface Addon {
  id: string;
  addonName: string;
  price: number;
  description?: string;
}

interface Service {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
  estimatedTime: string;
  addons: Addon[];
  isWishlisted?: boolean;
}

interface CartItem {
  service: Service;
  quantity: number;
  selectedAddons: string[]; // addon IDs
}

export default function BookLaundryPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  // Cart & Booking Details
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState("09:00 - 12:00");
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "ONLINE">("ONLINE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const servicesRes = await authFetch("/customer/services");
        const servicesData = await servicesRes.json();
        if (servicesData.success) {
          const list: Service[] = servicesData.data;
          setServices(list);

          // Get unique categories
          const cats = Array.from(new Set(list.map((s) => s.category)));
          setCategories(cats);
          if (cats.length > 0) setActiveCategory(cats[0]);
        }

        const profileRes = await authFetch("/customer/profile");
        const profileData = await profileRes.json();
        if (profileData.success) {
          setWalletBalance(profileData.data.walletBalance);
          setReceiverName(profileData.data.fullName);
          setReceiverPhone(profileData.data.phone || "");
        }
      } catch (err) {
        console.error("Error loading services/booking data:", err);
        toast.error("Failed to load laundry services");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleWishlist = async (service: Service) => {
    try {
      const isFav = service.isWishlisted;
      const endpoint = "/customer/wishlist";
      const method = isFav ? "DELETE" : "POST";
      const path = isFav ? `${endpoint}/${service.id}` : endpoint;
      const body = isFav ? undefined : JSON.stringify({ serviceId: service.id });

      const res = await authFetch(path, {
        method,
        body,
      });
      const data = await res.json();
      if (data.success) {
        setServices(services.map(s => s.id === service.id ? { ...s, isWishlisted: !isFav } : s));
        toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const addToCart = (service: Service) => {
    const existing = cart.find((item) => item.service.id === service.id);
    if (existing) {
      toast.info(`${service.serviceName} is already in your booking summary`);
      return;
    }
    setCart([...cart, { service, quantity: 1, selectedAddons: [] }]);
    toast.success(`Added ${service.serviceName} to booking`);
  };

  const updateQuantity = (serviceId: string, change: number) => {
    setCart(
      cart.map((item) => {
        if (item.service.id === serviceId) {
          const newQty = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const toggleAddon = (serviceId: string, addonId: string) => {
    setCart(
      cart.map((item) => {
        if (item.service.id === serviceId) {
          const exists = item.selectedAddons.includes(addonId);
          const newAddons = exists
            ? item.selectedAddons.filter((id) => id !== addonId)
            : [...item.selectedAddons, addonId];
          return { ...item, selectedAddons: newAddons };
        }
        return item;
      })
    );
  };

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter((item) => item.service.id !== serviceId));
  };

  // Prices calculation
  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      let itemPrice = item.service.basePrice;
      const selectedAddonPrices = item.service.addons
        .filter((a) => item.selectedAddons.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0);
      itemPrice += selectedAddonPrices;
      return total + itemPrice * item.quantity;
    }, 0);
  };

  const subtotal = getSubtotal();
  const deliveryCharge = subtotal > 300 || subtotal === 0 ? 0.0 : 50.0;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const grandTotal = subtotal + deliveryCharge + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error("Please select at least one laundry service");
      return;
    }
    if (!pickupAddress.trim()) {
      toast.error("Please enter a pickup address");
      return;
    }
    if (!pickupDate) {
      toast.error("Please choose a pickup date");
      return;
    }

    if (paymentMethod === "WALLET" && walletBalance < grandTotal) {
      toast.error("Insufficient wallet balance. Top up or select online payment.");
      return;
    }

    setSubmitting(true);
    try {
      const orderBody = {
        items: cart.map((item) => ({
          serviceId: item.service.id,
          quantity: item.quantity,
          addons: item.selectedAddons,
        })),
        pickupAddress,
        receiverName,
        receiverPhone,
        pickupDate,
        pickupTimeSlot,
        paymentMethod,
      };

      const orderRes = await authFetch("/customer/orders", {
        method: "POST",
        body: JSON.stringify(orderBody),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to submit order");
      }

      const createdOrder = orderData.data;

      if (paymentMethod === "WALLET") {
        toast.success("Order placed and paid successfully via Wallet!");
        router.push("/dashboard/my-orders?status=success");
      } else {
        // Online Payment Initialization
        toast.info("Initializing payment gateway...");
        const payRes = await authFetch("/payments/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: createdOrder.id }),
        });

        const payData = await payRes.json();
        if (payData.success && payData.data?.gatewayUrl) {
          window.location.href = payData.data.gatewayUrl; // Redirect to payment page
        } else {
          toast.error("Payment failed to initialize. Try paying from your Dashboard Orders tab.");
          router.push("/dashboard/my-orders");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Order placement failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredServices = services.filter((s) => s.category === activeCategory);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Book Laundry Services</h1>
        <p className="text-slate-500">Configure your garments, add optional treatments, and schedule home collection.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Side: Services & Categories */}
        <div className="lg:col-span-7 space-y-6">
          {/* Categories Selector Tabs */}
          <div className="flex flex-wrap gap-2.5 border-b border-slate-100 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredServices.map((service) => (
              <Card key={service.id} className="relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">{service.serviceName}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 mt-1">{service.garmentType} · {service.estimatedTime}</CardDescription>
                  </div>
                  <button
                    onClick={() => toggleWishlist(service)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      service.isWishlisted
                        ? "bg-rose-50 text-rose-500 border-rose-100"
                        : "bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-500"
                    }`}
                  >
                    <Heart size={14} fill={service.isWishlisted ? "currentColor" : "none"} />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline justify-between border-t border-slate-50 pt-3">
                    <span className="text-lg font-extrabold text-indigo-950">৳{service.basePrice.toFixed(2)}</span>
                    <Button 
                      onClick={() => addToCart(service)} 
                      size="sm" 
                      className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-bold"
                    >
                      Add +
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Booking summary & Pickup scheduling */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border border-slate-100 shadow-lg shadow-slate-100">
              <CardHeader className="bg-slate-50/50 border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900">Booking summary</CardTitle>
                <CardDescription>Configure selected items & schedules</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Cart Items list */}
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No items selected. Select services from the left side.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 space-y-4">
                    {cart.map((item) => (
                      <div key={item.service.id} className="pt-4 first:pt-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{item.service.serviceName}</h4>
                            <p className="text-[11px] text-indigo-600 font-semibold">৳{item.service.basePrice.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-full bg-slate-50/50 p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.service.id, -1)}
                                className="p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-2.5 text-xs font-extrabold text-slate-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.service.id, 1)}
                                className="p-1 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.service.id)}
                              className="text-rose-500 hover:text-rose-600 p-1.5"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Service Addons selection */}
                        {item.service.addons.length > 0 && (
                          <div className="space-y-1.5 bg-slate-50/40 p-2.5 rounded-xl border border-slate-50">
                            <p className="text-[11px] font-bold text-slate-500">Service Add-ons:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.service.addons.map((addon) => {
                                const isChecked = item.selectedAddons.includes(addon.id);
                                return (
                                  <button
                                    key={addon.id}
                                    type="button"
                                    onClick={() => toggleAddon(item.service.id, addon.id)}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                                      isChecked
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                    }`}
                                  >
                                    {addon.addonName} (+৳{addon.price})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pickup Address & Contact Details */}
                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Pickup Address</h3>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="receiverName" className="text-xs font-bold text-slate-600">Receiver Name</Label>
                      <Input
                        id="receiverName"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Full Name"
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="receiverPhone" className="text-xs font-bold text-slate-600">Receiver Phone</Label>
                      <Input
                        id="receiverPhone"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="Mobile Number"
                        required
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pickupAddress" className="text-xs font-bold text-slate-600">Full Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                      <Input
                        id="pickupAddress"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="House No, Road, Flat, Area Name"
                        required
                        className="pl-9 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Picker */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Schedule Pickup</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="pickupDate" className="text-xs font-bold text-slate-600">Pickup Date</Label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" size={14} />
                        <Input
                          id="pickupDate"
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          required
                          className="pl-9 h-9 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pickupTimeSlot" className="text-xs font-bold text-slate-600">Time Slot</Label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" size={14} />
                        <select
                          id="pickupTimeSlot"
                          value={pickupTimeSlot}
                          onChange={(e) => setPickupTimeSlot(e.target.value)}
                          className="w-full pl-9 h-9 text-xs border rounded-lg bg-white px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="09:00 - 12:00">Morning (09:00 AM - 12:00 PM)</option>
                          <option value="12:00 - 15:00">Noon (12:00 PM - 03:00 PM)</option>
                          <option value="15:00 - 18:00">Afternoon (03:00 PM - 06:00 PM)</option>
                          <option value="18:00 - 21:00">Evening (06:00 PM - 09:00 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Option */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Payment Method</h3>
                  <div className="grid gap-3 grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("ONLINE")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold transition-all text-xs gap-1 ${
                        paymentMethod === "ONLINE"
                          ? "bg-indigo-50/50 border-indigo-500 text-indigo-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <CreditCard size={18} />
                      SSLCommerz
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("WALLET")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold transition-all text-xs gap-1 ${
                        paymentMethod === "WALLET"
                          ? "bg-indigo-50/50 border-indigo-500 text-indigo-600 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Wallet size={18} />
                      Wallet (৳{walletBalance.toFixed(2)})
                    </button>
                  </div>
                </div>

                {/* Total computation breakdown */}
                <div className="pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-slate-900">
                      {deliveryCharge === 0.0 ? "FREE" : `৳${deliveryCharge.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT / Tax (5%)</span>
                    <span className="font-semibold text-slate-900">৳{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-50">
                    <span>Grand Total</span>
                    <span className="text-indigo-600 text-base">৳{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Placing Order...
                    </>
                  ) : (
                    "Place & Confirm Order"
                  )}
                </Button>

              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
