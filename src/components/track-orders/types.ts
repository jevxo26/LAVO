// ─── Data interfaces ──────────────────────────────────────────────────────────

export interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string;
  createdAt: string;
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
}

// ─── Tracking steps ───────────────────────────────────────────────────────────

export const TRACKING_STEPS = [
  { key: "PENDING",            label: "Order Placed",       desc: "We received your laundry request."                                 },
  { key: "CONFIRMED",          label: "Confirmed",          desc: "A pickup agent has been assigned to your zone."                    },
  { key: "PICKUP",             label: "Collected",          desc: "Garments collected and QR tracking labels generated."              },
  { key: "PROCESSING",         label: "Sorting & Prep",     desc: "Laundry items sorting at the centralized branch hub."             },
  { key: "WASHING",            label: "Washing",            desc: "Garments undergoing washing or dry-cleaning cycles."              },
  { key: "DRYING",             label: "Drying",             desc: "Garments being dried at optimal temperature."                     },
  { key: "IRONING",            label: "Ironing",            desc: "Garments being pressed and ironed for a fresh finish."            },
  { key: "FOLDING",            label: "Folding & Packing",  desc: "Garments neatly folded and packed for delivery."                  },
  { key: "READY_FOR_DELIVERY", label: "Ready for Delivery", desc: "Your laundry is packed and a delivery agent has been assigned."   },
  { key: "OUT_FOR_DELIVERY",   label: "Out for Delivery",   desc: "Delivery agent is on the way to your address."                    },
  { key: "DELIVERED",          label: "Delivered",          desc: "Laundry package successfully hand-delivered. Enjoy!"              },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_INDEX_MAP: Record<string, number> = {
  PENDING: 0, CONFIRMED: 1, PICKUP: 2, PROCESSING: 3,
  WASHING: 4, DRYING: 5,   IRONING: 6, FOLDING: 7,
  READY_FOR_DELIVERY: 8, OUT_FOR_DELIVERY: 9,
  DELIVERED: 10, COMPLETED: 10, DELIVERY: 9,
};

export function getStepIndex(status: string): number {
  if (status.toUpperCase() === "CANCELLED") return -1;
  return STATUS_INDEX_MAP[status.toUpperCase()] ?? 0;
}

export function progressPercent(stepIdx: number): number {
  if (stepIdx < 0) return 0;
  return Math.round((stepIdx / (TRACKING_STEPS.length - 1)) * 100);
}
