// ─── Data interfaces ──────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  service: {
    serviceName: string;
  };
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  totalGarments: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  tax: number;
  grandTotal: number;
  paymentStatus: string;
  orderStatus: string;
  pickupAddressId: string;
  estimatedPickupTime: string;
  createdAt: string;
  items: OrderItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 8;

export const STATUS_TABS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
export type StatusTab = (typeof STATUS_TABS)[number];

/** Statuses that are grouped under the PROCESSING tab */
export const PROCESSING_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "PICKUP",
  "WASHING",
  "DRYING",
  "IRONING",
  "FOLDING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERY",
];

/** Ordered steps used for the order timeline */
export const TIMELINE_STEPS = [
  { key: "PENDING",            label: "Order Placed",      icon: "clipboard" },
  { key: "CONFIRMED",          label: "Confirmed",         icon: "check"     },
  { key: "PICKUP",             label: "Picked Up",         icon: "truck"     },
  { key: "WASHING",            label: "In Process",        icon: "shirt"     },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery",icon: "package"   },
  { key: "DELIVERY",           label: "Out for Delivery",  icon: "zap"       },
  { key: "COMPLETED",          label: "Delivered",         icon: "star"      },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Returns the active step index (0-based) for the timeline */
export function getTimelineStep(status: string): number {
  const s = (status ?? "").toUpperCase();
  const idx = TIMELINE_STEPS.findIndex((t) => t.key === s);
  if (idx !== -1) return idx;

  if (s === "PROCESSING" || s === "DRYING" || s === "IRONING" || s === "FOLDING") return 3;
  if (s === "READY" || s === "READY_FOR_DELIVERY") return 4;
  if (s === "OUT_FOR_DELIVERY" || s === "DELIVERY" || s === "ON_DELIVERY") return 5;
  if (s === "DELIVERED" || s === "COMPLETED") return 6;
  return 0;
}

/** Colour classes for order status badges */
export function orderStatusStyle(status: string): { cls: string; dot: string; label: string } {
  const map: Record<string, { cls: string; dot: string; label: string }> = {
    PENDING:            { cls: "bg-amber-50   text-amber-700   border-amber-200",   dot: "bg-amber-400",   label: "Pending"            },
    CONFIRMED:          { cls: "bg-blue-50    text-blue-700    border-blue-200",    dot: "bg-blue-500",    label: "Confirmed"          },
    PROCESSING:         { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500",  label: "Processing"         },
    WASHING:            { cls: "bg-indigo-50  text-indigo-700  border-indigo-200",  dot: "bg-indigo-500",  label: "Washing"            },
    DRYING:             { cls: "bg-cyan-50    text-cyan-700    border-cyan-200",    dot: "bg-cyan-500",    label: "Drying"             },
    IRONING:            { cls: "bg-sky-50     text-sky-700     border-sky-200",     dot: "bg-sky-500",     label: "Ironing"            },
    FOLDING:            { cls: "bg-teal-50    text-teal-700    border-teal-200",    dot: "bg-teal-500",    label: "Folding"            },
    PICKUP:             { cls: "bg-violet-50  text-violet-700  border-violet-200",  dot: "bg-violet-500",  label: "Pickup"             },
    READY_FOR_DELIVERY: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Ready for Delivery" },
    DELIVERY:           { cls: "bg-purple-50  text-purple-700  border-purple-200",  dot: "bg-purple-500",  label: "Out for Delivery"   },
    OUT_FOR_DELIVERY:   { cls: "bg-purple-50  text-purple-700  border-purple-200",  dot: "bg-purple-500",  label: "Out for Delivery"   },
    COMPLETED:          { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Completed"          },
    DELIVERED:          { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Delivered"          },
    CANCELLED:          { cls: "bg-rose-50    text-rose-700    border-rose-200",    dot: "bg-rose-400",    label: "Cancelled"          },
  };
  return map[(status ?? "").toUpperCase()] ?? { cls: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400", label: status ?? "Unknown" };
}

/** Colour classes for payment status badges */
export function paymentStatusStyle(status: string): { cls: string; dot: string; label: string } {
  const s = (status ?? "").toUpperCase();
  if (s === "PAID")
    return { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Paid" };
  return { cls: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-400", label: "Unpaid" };
}

/** Gradient thumbnails seeded by order number */
const GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-indigo-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-sky-400 to-cyan-600",
];

export function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
