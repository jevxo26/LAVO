export interface Addon {
  id: string;
  addonName: string;
  price: number;
  description?: string;
}

export interface Service {
  id: string;
  serviceName: string;
  description?: string;
  basePrice: number;
  garmentType: string;
  category: string;
  estimatedTime: string;
  addons: Addon[];
  isWishlisted?: boolean;
}

export interface GarmentItem {
  type: string;   // e.g. "Shirt", "Pants", "Suit Jacket"
  qty: number;
}

export interface CartItem {
  service: Service;
  quantity: number;          // auto-sum of garmentBreakdown qtys
  selectedAddons: string[];
  garmentBreakdown: GarmentItem[];  // per-garment type counts
}

export type PaymentMethod = "WALLET" | "ONLINE";
