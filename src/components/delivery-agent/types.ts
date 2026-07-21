export interface AvailablePickup {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  pickupAddress: string;
  distance: string; 
  priority: string;
  status: string;
  totalGarments?: number;
  createdAt: string;
}

export interface AvailableDelivery {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  deliveryAddress: string;
  parcelType: string;
  paymentType: string;
  weight: string | number;
  codAmount: number;
  distance: string;
  priority: string;
  status: string;
  totalGarments?: number;
  createdAt: string;
}


export interface OptimizedRoute {
  id: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  totalStops: number;
  totalDistance: string;
  estimatedTime: string;
  pickups: number;
  deliveries: number;
  status: string;

  latitude: number | null;
  longitude: number | null;
  type?: string;
}

export interface VerificationType {
  deliveryId: string;
  orderId: string;
  deliveryType: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryStatus: string;
  verificationStatus: string;
}

export interface History {
    deliveryId: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    branch: string;
    amount: number;
    paymentStatus: string;
    status: string;
    completedAt: string | null;
}