"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, Minus, Plus, Trash2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Garment = { name: string; basePrice: number; isCustom?: boolean };
type Service = { name: string; addOn: number };
type Turnaround = { name: string; multiplier: number };

type BookingItem = {
  id: string;
  garment: Garment;
  isCustom?: boolean;
  customGarmentName?: string;
  quantity: number;
  services: Service[];
};

// ─── Hardcoded fallback data ──────────────────────────────────────────────────

const DEFAULT_GARMENTS: Garment[] = [
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

const CUSTOM_GARMENT_OPTION: Garment = {
  name: "Can't find? Type garment name",
  basePrice: 50,
  isCustom: true,
};

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
  const garments: Garment[] = items
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
  const router = useRouter();

  // Parse CMS data, falling back to hardcoded defaults per category
  const cmsItems: CmsItem[] = data?.items ?? [];
  const parsed = parsePricingData(cmsItems);

  const baseGarments: Garment[] = parsed.garments.length ? parsed.garments : DEFAULT_GARMENTS;
  const garments: Garment[] = [...baseGarments, CUSTOM_GARMENT_OPTION];
  const services = parsed.services.length ? parsed.services : DEFAULT_SERVICES;
  const turnarounds = parsed.turnarounds.length ? parsed.turnarounds : DEFAULT_TURNAROUNDS;
  const addons = parsed.addons.length ? parsed.addons : DEFAULT_ADDONS;

  const [applySameServiceToAll, setApplySameServiceToAll] = useState(true);
  const [globalServices, setGlobalServices] = useState<Service[]>(() => [
    services[1] ?? services[0],
  ]);
  const [items, setItems] = useState<BookingItem[]>(() => [
    {
      id: "item-1",
      garment: garments[2] ?? garments[0],
      quantity: 5,
      services: [services[1] ?? services[0]],
    },
  ]);
  const [selectedTurnaround, setSelectedTurnaround] = useState<Turnaround>(turnarounds[0]);

  // Handlers for garments
  const handleAddGarment = () => {
    const selectedGarmentNames = new Set(items.map((i) => i.garment.name));
    const availableGarment =
      garments.find((g) => !g.isCustom && !selectedGarmentNames.has(g.name)) ?? garments[0];
    const newId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setItems((prev) => [
      ...prev,
      {
        id: newId,
        garment: availableGarment,
        quantity: 1,
        services: applySameServiceToAll ? [...globalServices] : [services[0]],
      },
    ]);
  };

  const handleRemoveGarment = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGarmentChange = (id: string, garmentName: string) => {
    const garment = garments.find((g) => g.name === garmentName);
    if (!garment) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            garment,
            isCustom: !!garment.isCustom,
            customGarmentName: garment.isCustom ? item.customGarmentName ?? "" : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleCustomNameChange = (id: string, customName: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customGarmentName: customName } : item))
    );
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Handlers for services (Single Select Logic)
  const handleSelectGlobalService = (service: Service) => {
    const updated = [service];
    setGlobalServices(updated);
    setItems((itemsPrev) =>
      itemsPrev.map((item) => ({ ...item, services: updated }))
    );
  };

  const handleSelectItemService = (id: string, service: Service) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, services: [service] };
      })
    );
  };

  const handleToggleApplySame = (checked: boolean) => {
    setApplySameServiceToAll(checked);
    if (checked) {
      setItems((prev) =>
        prev.map((item) => ({ ...item, services: [...globalServices] }))
      );
    } else {
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          services: item.services.length > 0 ? item.services : [...globalServices],
        }))
      );
    }
  };

  const handleTurnaroundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ta = turnarounds.find((t) => t.name === e.target.value);
    if (ta) setSelectedTurnaround(ta);
  };

  // Calculations
  const calculateItemTotal = (item: BookingItem) => {
    const activeServices = applySameServiceToAll ? globalServices : item.services;
    const servicesAddOn = activeServices.reduce((sum, s) => sum + s.addOn, 0);
    const basePrice = item.isCustom ? CUSTOM_GARMENT_OPTION.basePrice : item.garment.basePrice;
    return (basePrice + servicesAddOn) * item.quantity;
  };

  const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const total = Math.round(subtotal * selectedTurnaround.multiplier);
  const totalGarmentsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const deliveryLabel = (() => {
    const match = selectedTurnaround.name.match(/\(([^)]+)\)/);
    return match ? match[1] : selectedTurnaround.name;
  })();

  const getItemDisplayName = (item: BookingItem) => {
    if (item.isCustom) {
      return item.customGarmentName?.trim() ? item.customGarmentName.trim() : "Custom Garment";
    }
    return item.garment.name;
  };

  const handleSchedulePickup = () => {
    const bookingPayload = {
      items: items.map((item) => {
        const activeServices = applySameServiceToAll ? globalServices : item.services;
        const displayName = getItemDisplayName(item);
        return {
          garment: displayName,
          isCustom: !!item.isCustom,
          basePrice: item.isCustom ? CUSTOM_GARMENT_OPTION.basePrice : item.garment.basePrice,
          quantity: item.quantity,
          services: activeServices.map((s) => ({ name: s.name, addOn: s.addOn })),
          itemTotal: calculateItemTotal(item),
        };
      }),
      applySameServiceToAll,
      globalServices: globalServices.map((s) => ({ name: s.name, addOn: s.addOn })),
      turnaround: selectedTurnaround,
      subtotal,
      totalPrice: total,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pending_laundry_booking", JSON.stringify(bookingPayload));
    }
    router.push("/dashboard/book-services");
  };

  return (
    <section className="w-full pb-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm"
          >
            {/* Toggle logic bar */}
            <div className="flex items-center justify-between p-4 mb-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="same-service-toggle"
                  checked={applySameServiceToAll}
                  onChange={(e) => handleToggleApplySame(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="same-service-toggle"
                  className="text-sm font-semibold text-slate-800 cursor-pointer select-none"
                >
                  Apply the same service(s) to all garments
                </label>
              </div>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {applySameServiceToAll ? "Unified Services" : "Custom Per Garment"}
              </span>
            </div>

            {/* Garments list */}
            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Garment Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGarment(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50"
                        title="Remove garment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    {/* Select Garment */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-900">
                        Select Garment
                      </label>
                      <div className="relative">
                        <select
                          value={item.garment.name}
                          onChange={(e) => handleGarmentChange(item.id, e.target.value)}
                          className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer text-sm"
                        >
                          {garments.map((g) => (
                            <option key={g.name} value={g.name}>
                              {g.isCustom ? g.name : `${g.name} (৳${g.basePrice})`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                          <svg
                            width="10"
                            height="6"
                            viewBox="0 0 12 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 1.5L6 6.5L11 1.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Custom Garment Text Input */}
                      {item.isCustom && (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={item.customGarmentName ?? ""}
                            onChange={(e) => handleCustomNameChange(item.id, e.target.value)}
                            placeholder="Type garment name (e.g. Silk Dupatta)"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <span className="text-[11px] text-blue-600 font-medium mt-1 block">
                            Fixed base rate: ৳50
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-900">Quantity</label>
                      <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-1.5 bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-base font-bold text-slate-900 w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 border border-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Individual service selection when applySameServiceToAll is FALSE */}
                  {!applySameServiceToAll && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                        Service for {getItemDisplayName(item)}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {services.map((s) => {
                          const isChecked = item.services.some(
                            (sel) => sel.name === s.name
                          );
                          return (
                            <label
                              key={s.name}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                isChecked
                                  ? "border-blue-500 bg-blue-50/70 text-blue-900 font-semibold"
                                  : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSelectItemService(item.id, s)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                              />
                              <span className="flex-1 truncate">{s.name}</span>
                              <span className="text-slate-400 font-normal">
                                {s.addOn > 0 ? `+৳${s.addOn}` : "Free"}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add another garment button */}
            <div className="mt-4 mb-8">
              <button
                type="button"
                onClick={handleAddGarment}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-dashed border-blue-200 transition-colors cursor-pointer"
              >
                <Plus size={16} />
                Add another garment
              </button>
            </div>

            {/* Global Service Selection (when applySameServiceToAll is TRUE) */}
            {applySameServiceToAll && (
              <div className="flex flex-col gap-3 mb-8 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <label className="text-base font-bold text-slate-900">
                    Select Service
                  </label>
                  <span className="text-xs text-slate-500 font-medium">
                    Applied to all garments
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {services.map((s) => {
                    const isChecked = globalServices.some((sel) => sel.name === s.name);
                    return (
                      <label
                        key={s.name}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                          isChecked
                            ? "border-blue-500 bg-white text-blue-900 font-semibold shadow-sm ring-1 ring-blue-500/20"
                            : "border-slate-200 hover:border-slate-300 text-slate-700 font-medium bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectGlobalService(s)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600"
                        />
                        <span className="flex-1">{s.name}</span>
                        <span className="text-xs text-slate-500 font-normal">
                          {s.addOn > 0 ? `+৳${s.addOn}` : "Free"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

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
                    <option key={t.name} value={t.name}>
                      {t.name} {t.multiplier > 1 ? `(${t.multiplier}x speed fee)` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
            className="lg:col-span-5 bg-navy-darker text-foreground rounded-[24px] p-8 shadow-xl border border-border flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold tracking-wide uppercase mb-6 text-foreground">
                ESTIMATED PRICE
              </h3>

              <div className="bg-brand-blue rounded-2xl p-6 text-center mb-6">
                <span className="block text-blue-100 text-xs font-medium mb-1">
                  Estimated Total
                </span>
                <div className="text-4xl md:text-5xl font-bold text-white mb-1 tracking-tight">
                  ৳ {total}
                </div>
                <span className="block text-blue-100/80 text-[10px] font-medium">
                  incl. pickup & delivery
                </span>
              </div>

              {/* Order Items Breakdown */}
              <div className="mb-6 bg-card/50 rounded-xl p-4 border border-border/60">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex justify-between">
                  <span>Selected Garments</span>
                  <span>
                    {totalGarmentsCount} pcs ({items.length} types)
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {items.map((item) => {
                    const activeServices = applySameServiceToAll
                      ? globalServices
                      : item.services;
                    const itemTotal = calculateItemTotal(item);
                    const displayName = getItemDisplayName(item);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-start text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <span className="font-semibold text-foreground">
                            {item.quantity}x {displayName}
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            {activeServices.map((s) => s.name).join(", ") || "No service"}
                          </p>
                        </div>
                        <span className="font-semibold text-foreground">৳{itemTotal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                  <span className="block text-muted-foreground text-xs mb-1 font-medium">
                    Items
                  </span>
                  <span className="block text-foreground font-semibold text-sm truncate">
                    {items.length} ({totalGarmentsCount} pcs)
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                  <span className="block text-muted-foreground text-xs mb-1 font-medium">
                    Delivery
                  </span>
                  <span className="block text-foreground font-semibold text-sm truncate">
                    {deliveryLabel}
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                  <span className="block text-muted-foreground text-xs mb-1 font-medium">
                    Pickup
                  </span>
                  <span className="block text-foreground font-semibold text-sm">Free</span>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
                  <span className="block text-slate-400 text-xs mb-1 font-medium">
                    Payment
                  </span>
                  <span className="block text-foreground font-semibold text-sm">
                    On delivery
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSchedulePickup}
              className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.99] cursor-pointer"
            >
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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-2 shadow-sm">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                ADD-ONS
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-900 mb-2">
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
