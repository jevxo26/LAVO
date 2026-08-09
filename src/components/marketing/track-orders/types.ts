// ─── Data interfaces ──────────────────────────────────────────────────────────

export interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface GarmentItemRecord {
  id: string;
  garmentName: string;
  garmentCode: string;
  status: string;
  qrCodeRecord?: { qrCode: string } | null;
}

export interface OrderItemDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service?: {
    id: string;
    serviceName: string;
    description?: string;
    category?: string;
    garmentType?: { name: string };
  };
  garmentItems?: GarmentItemRecord[];
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  grandTotal: number;
  totalGarments: number;
  createdAt: string;
  estimatedPickupTime: string;
  estimatedDeliveryTime?: string;
  timelines: OrderTimeline[];
  items?: OrderItemDetail[];
}

// ─── Tracking step definition ──────────────────────────────────────────────────

export interface TrackingStepDef {
  key: string;
  label: string;
  desc: string;
}

// Default static steps (fallback)
export const TRACKING_STEPS: TrackingStepDef[] = [
  { key: "PENDING",            label: "Order Placed",       desc: "We received your laundry request." },
  { key: "CONFIRMED",          label: "Confirmed",          desc: "A pickup agent has been assigned to your zone." },
  { key: "PICKUP",             label: "Collected",          desc: "Garments collected and QR tracking labels generated." },
  { key: "PROCESSING",         label: "Sorting & Prep",     desc: "Laundry items sorting at the centralized branch hub." },
  { key: "WASHING",            label: "Washing",            desc: "Garments undergoing washing cycle." },
  { key: "DRYING",             label: "Drying",             desc: "Garments being dried at optimal temperature." },
  { key: "IRONING",            label: "Ironing & Pressing", desc: "Garments being pressed for a fresh finish." },
  { key: "FOLDING",            label: "Folding & Packing",  desc: "Garments neatly folded and packed for delivery." },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery", desc: "Your laundry is packed and a delivery agent has been assigned." },
  { key: "OUT_FOR_DELIVERY",   label: "Out for Delivery",   desc: "Delivery agent is on the way to your address." },
  { key: "DELIVERED",          label: "Delivered",          desc: "Laundry package successfully hand-delivered. Enjoy!" },
];

// ─── Service-Specific Dynamic Tracking Steps ──────────────────────────────────

export function getTrackingStepsForOrder(order?: OrderDetails | null): TrackingStepDef[] {
  if (!order) return TRACKING_STEPS;

  const serviceNames = (order.items || [])
    .map((item) => (item.service?.serviceName || "").toLowerCase())
    .join(" ");

  const baseStart: TrackingStepDef[] = [
    { key: "PENDING",   label: "Order Placed", desc: "We received your laundry request." },
    { key: "CONFIRMED", label: "Confirmed",    desc: "A pickup agent has been assigned to your zone." },
    { key: "PICKUP",    label: "Collected",    desc: "Garments collected and QR tracking labels generated." },
  ];

  const baseEnd: TrackingStepDef[] = [
    { key: "READY_FOR_DELIVERY", label: "Ready for Delivery", desc: "Your laundry is packed and a delivery agent has been assigned." },
    { key: "OUT_FOR_DELIVERY",   label: "Out for Delivery",   desc: "Delivery agent is on the way to your address." },
    { key: "DELIVERED",          label: "Delivered",          desc: "Laundry package successfully hand-delivered. Enjoy!" },
  ];

  let processingSteps: TrackingStepDef[] = [];

  if (serviceNames.includes("steam iron") || serviceNames.includes("ironing")) {
    processingSteps = [
      { key: "IRONING", label: "Steam Ironing & Pressing", desc: "Garments being professionally steam ironed." },
      { key: "FOLDING", label: "Hanger & Protective Packaging", desc: "Garments placed on hangers and wrapped." },
    ];
  } else if (serviceNames.includes("dry clean")) {
    processingSteps = [
      { key: "DRY_CLEANING", label: "Dry Cleaning & Solvent Treatment", desc: "Garments undergo eco-friendly dry cleaning." },
      { key: "PRESSING",     label: "Steam Pressing & Finishing",       desc: "Garments steam pressed and ironed." },
      { key: "FOLDING",      label: "Protective Packaging",             desc: "Garments covered in protective plastic wrapping." },
    ];
  } else if (serviceNames.includes("wash only")) {
    processingSteps = [
      { key: "WASHING", label: "Washing Cycle", desc: "Garments washed using premium tailored detergents." },
      { key: "DRYING",  label: "Tumble Drying",  desc: "Garments dried at gentle optimal temperatures." },
    ];
  } else if (serviceNames.includes("stain removal")) {
    processingSteps = [
      { key: "STAIN_TREATMENT", label: "Stain Spotting & Removal", desc: "Specialized stain removal treatment applied." },
      { key: "WASHING",         label: "Deep Wash",                desc: "Thorough washing cycle." },
      { key: "DRYING",          label: "Drying",                   desc: "Garments dried at optimal temperature." },
      { key: "FOLDING",         label: "Folding & Packing",        desc: "Garments folded and packed." },
    ];
  } else {
    // Standard Wash & Fold / Wash & Iron / Default
    processingSteps = [
      { key: "PROCESSING", label: "Sorting & Inspection", desc: "Garments sorted and inspected at central branch hub." },
      { key: "WASHING",    label: "Washing Cycle",         desc: "Garments washed using tailored care programs." },
      { key: "DRYING",     label: "Drying",                desc: "Garments dried at optimal temperature." },
      { key: "IRONING",    label: "Ironing & Pressing",    desc: "Garments ironed for a crisp, clean finish." },
      { key: "FOLDING",    label: "Folding & Packaging",   desc: "Garments neatly folded and packed for delivery." },
    ];
  }

  return [...baseStart, ...processingSteps, ...baseEnd];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStepIndexForOrder(status: string, steps: TrackingStepDef[]): number {
  if (!status || status.toUpperCase() === "CANCELLED") return -1;
  const sUpper = status.toUpperCase();

  const idx = steps.findIndex((s) => s.key === sUpper);
  if (idx >= 0) return idx;

  // Fallback aliases
  if (sUpper === "COMPLETED") return steps.length - 1;
  if (sUpper === "COLLECTED") {
    const pIdx = steps.findIndex((s) => s.key === "PICKUP");
    if (pIdx >= 0) return pIdx;
  }
  return 0;
}

export function progressPercentForOrder(stepIdx: number, totalSteps: number): number {
  if (stepIdx < 0 || totalSteps <= 1) return 0;
  return Math.min(100, Math.round((stepIdx / (totalSteps - 1)) * 100));
}

// Legacy exports for backward compatibility
export function getStepIndex(status: string): number {
  return getStepIndexForOrder(status, TRACKING_STEPS);
}

export function progressPercent(stepIdx: number): number {
  return progressPercentForOrder(stepIdx, TRACKING_STEPS.length);
}
