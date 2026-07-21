export interface ReviewData {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: string;
  createdAt: string;
}

export interface OrderReview {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  serviceName: string;
  grandTotal: number;
  review: ReviewData | null;
}

export type SortOption = "newest" | "oldest" | "highest";

export const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
export const PAGE_SIZE = 6;

const CARD_GRADIENTS = [
  "from-violet-100 to-purple-200",
  "from-blue-100 to-indigo-200",
  "from-emerald-100 to-teal-200",
  "from-amber-100 to-orange-200",
  "from-rose-100 to-pink-200",
  "from-sky-100 to-cyan-200",
];

export function gradientFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return CARD_GRADIENTS[h % CARD_GRADIENTS.length];
}

export function serviceType(name: string): "Express" | "Standard" {
  const n = name.toLowerCase();
  if (n.includes("express") || n.includes("premium") || n.includes("dry")) return "Express";
  return "Standard";
}

export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function avgRating(items: OrderReview[]) {
  const rated = items.filter((i) => i.review);
  if (!rated.length) return 0;
  return rated.reduce((s, i) => s + i.review!.rating, 0) / rated.length;
}

export function buildPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
