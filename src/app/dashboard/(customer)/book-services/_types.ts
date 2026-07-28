export interface Addon {
  id: string;
  addonName: string;
  price: number;
  description?: string;
}

export interface Service {
  id: string;
  serviceName: string;
  basePrice: number;
  garmentType: string;
  category: string;
  estimatedTime: string;
  addons: Addon[];
  isWishlisted?: boolean;
}

export interface CartItem {
  service: Service;
  quantity: number;
  selectedAddons: string[];
}

export type PaymentMethod = "WALLET" | "ONLINE";
