"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authFetch } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { CartItem, GarmentItem, PaymentMethod, Service } from "../_types";

export function useBooking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedServiceParam = searchParams.get("service") || searchParams.get("serviceId") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [autoSelectedService, setAutoSelectedService] = useState<Service | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLat, setPickupLat] = useState<number | null>(null);
  const [pickupLon, setPickupLon] = useState<number | null>(null);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState("09:00 - 12:00");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const servicesRes = await authFetch("/customer/services");
        const servicesData = await servicesRes.json();
        if (servicesData.success) {
          const list: Service[] = servicesData.data;
          setServices(list);
          const cats = Array.from(new Set(list.map((s) => s.category)));
          setCategories(cats);
          setActiveCategory("");

          let loadedFromSession = false;
          if (typeof window !== "undefined") {
            const rawPayload = sessionStorage.getItem("pending_laundry_booking");
            if (rawPayload) {
              try {
                const booking = JSON.parse(rawPayload);
                if (booking.items && Array.isArray(booking.items) && booking.items.length > 0) {
                  const newCartItems: CartItem[] = [];
                  for (const bItem of booking.items) {
                    const mainServiceName = bItem.services?.[0]?.name;
                    const matched = list.find((s) =>
                      mainServiceName
                        ? s.serviceName.toLowerCase().includes(mainServiceName.toLowerCase())
                        : false
                    ) || list.find((s) => bItem.garment && s.garmentType.toLowerCase().includes(bItem.garment.toLowerCase())) || list[0];

                    if (matched) {
                      const garmentName = bItem.garment || matched.garmentType || "General Item";
                      const itemQty = bItem.quantity || 1;

                      const existingIdx = newCartItems.findIndex((c) => c.service.id === matched.id);
                      if (existingIdx >= 0) {
                        newCartItems[existingIdx].quantity += itemQty;
                        const existingG = newCartItems[existingIdx].garmentBreakdown.find(
                          (g) => g.type.toLowerCase() === garmentName.toLowerCase()
                        );
                        if (existingG) {
                          existingG.qty += itemQty;
                        } else {
                          newCartItems[existingIdx].garmentBreakdown.push({ type: garmentName, qty: itemQty });
                        }
                      } else {
                        newCartItems.push({
                          service: matched,
                          quantity: itemQty,
                          selectedAddons: [],
                          garmentBreakdown: [{ type: garmentName, qty: itemQty }],
                        });
                      }
                    }
                  }

                  if (newCartItems.length > 0) {
                    setCart(newCartItems);
                    setAutoSelectedService(newCartItems[0].service);
                    loadedFromSession = true;
                    toast.success("Loaded your custom selection from Pricing Calculator!");
                    sessionStorage.removeItem("pending_laundry_booking");
                  }
                }
              } catch (e) {
                console.error("Failed to parse pending booking from sessionStorage", e);
              }
            }
          }

          // ── Auto-add requested service from URL parameter if not loaded from session ──
          if (!loadedFromSession && requestedServiceParam && list.length > 0) {
            const query = requestedServiceParam.toLowerCase().trim();
            const matched = list.find(
              (s) =>
                s.id === requestedServiceParam ||
                s.serviceName.toLowerCase().includes(query) ||
                s.category.toLowerCase().includes(query) ||
                s.garmentType.toLowerCase().includes(query)
            );

            if (matched) {
              const defaultGarment = matched.garmentType || "Shirt";
              setCart([{ service: matched, quantity: 1, selectedAddons: [], garmentBreakdown: [{ type: defaultGarment, qty: 1 }] }]);
              setAutoSelectedService(matched);
            }
          }
        }

        const profileRes = await authFetch("/customer/profile");
        const profileData = await profileRes.json();
        if (profileData.success) {
          setWalletBalance(profileData.data.walletBalance);
          setReceiverName(profileData.data.fullName);
          // Keep receiverPhone empty so testing number can be typed freely per order
          setReceiverPhone("");
        }
      } catch (err) {
        console.error("Error loading booking data:", err);
        toast.error("Failed to load laundry services");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [requestedServiceParam]);

  const toggleWishlist = async (service: Service) => {
    try {
      const isFav = service.isWishlisted;
      const res = await authFetch(
        isFav ? `/customer/wishlist/${service.id}` : "/customer/wishlist",
        {
          method: isFav ? "DELETE" : "POST",
          body: isFav ? undefined : JSON.stringify({ serviceId: service.id }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isWishlisted: !isFav } : s))
        );
        toast.success(isFav ? "Removed from wishlist" : "Added to wishlist");
      }
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  const addToCart = (service: Service) => {
    if (cart.some((item) => item.service.id === service.id)) {
      toast.info(`${service.serviceName} is already in your booking`);
      return;
    }
    const defaultGarment = service.garmentType || "Shirt";
    setCart((prev) => [...prev, { service, quantity: 1, selectedAddons: [], garmentBreakdown: [{ type: defaultGarment, qty: 1 }] }]);
    toast.success(`Added ${service.serviceName}`);
  };

  const removeFromCart = (serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.service.id !== serviceId));
  };

  const updateQuantity = (serviceId: string, change: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.service.id === serviceId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const toggleAddon = (serviceId: string, addonId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.service.id !== serviceId) return item;
        const exists = item.selectedAddons.includes(addonId);
        return {
          ...item,
          selectedAddons: exists
            ? item.selectedAddons.filter((id) => id !== addonId)
            : [...item.selectedAddons, addonId],
        };
      })
    );
  };

  // Update quantity of a specific garment type within a cart item.
  // qty=0 removes that garment type entry. Total quantity auto-recalculates.
  const updateGarmentQty = (serviceId: string, garmentType: string, change: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.service.id !== serviceId) return item;
        const existing = item.garmentBreakdown.find((g) => g.type === garmentType);
        let newBreakdown: GarmentItem[];
        if (existing) {
          const newQty = Math.max(0, existing.qty + change);
          newBreakdown = newQty === 0
            ? item.garmentBreakdown.filter((g) => g.type !== garmentType)
            : item.garmentBreakdown.map((g) => g.type === garmentType ? { ...g, qty: newQty } : g);
        } else if (change > 0) {
          newBreakdown = [...item.garmentBreakdown, { type: garmentType, qty: change }];
        } else {
          newBreakdown = item.garmentBreakdown;
        }
        const totalQty = newBreakdown.reduce((s, g) => s + g.qty, 0);
        return { ...item, garmentBreakdown: newBreakdown, quantity: Math.max(1, totalQty) };
      })
    );
  };

  const subtotal = cart.reduce((total, item) => {
    const addonCost = item.service.addons
      .filter((a) => item.selectedAddons.includes(a.id))
      .reduce((s, a) => s + a.price, 0);
    return total + (item.service.basePrice + addonCost) * item.quantity;
  }, 0);

  const deliveryCharge = subtotal > 300 || subtotal === 0 ? 0 : 50;
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const grandTotal = subtotal + deliveryCharge + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error("Please select at least one service"); return; }
    if (!pickupAddress.trim()) { toast.error("Please enter a pickup address"); return; }
    if (!receiverPhone.trim()) { toast.error("Please enter a contact phone number"); return; }
    if (!pickupDate) { toast.error("Please choose a pickup date"); return; }
    if (paymentMethod === "WALLET" && walletBalance < grandTotal) {
      toast.error("Insufficient wallet balance. Top up or select online payment.");
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await authFetch("/customer/orders", {
        method: "POST",
        body: JSON.stringify({
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
          latitude: pickupLat,
          longitude: pickupLon,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || "Failed to submit order");

      if (paymentMethod === "WALLET") {
        toast.success("Order placed successfully via Wallet!");
        router.push("/dashboard/my-orders?status=success");
      } else {
        toast.info("Initializing payment gateway...");
        const payRes = await authFetch("/payments/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: orderData.data.id }),
        });
        const payData = await payRes.json();
        if (payData.success && payData.data?.gatewayUrl) {
          window.location.href = payData.data.gatewayUrl;
        } else {
          toast.error("Payment failed to initialize. Try paying from your Orders tab.");
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

  return {
    services, categories, activeCategory, setActiveCategory,
    loading, walletBalance,
    cart, addToCart, removeFromCart, updateQuantity, updateGarmentQty, toggleAddon,
    toggleWishlist,
    receiverName, setReceiverName,
    receiverPhone, setReceiverPhone,
    pickupAddress, setPickupAddress,
    pickupLat, setPickupLat,
    pickupLon, setPickupLon,
    pickupDate, setPickupDate,
    pickupTimeSlot, setPickupTimeSlot,
    paymentMethod, setPaymentMethod,
    subtotal, deliveryCharge, tax, grandTotal,
    submitting, handleSubmit,
    requestedServiceParam,
    autoSelectedService,
  };
}
