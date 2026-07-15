export interface AvailableDelivery {
  id: string;
  orderId: string;
  agentId?: string;
  agentName?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  branch: string;
  parcelType: string;
  weight: string;
  paymentType: "Prepaid" | "COD";
  deliveryFee: number;
  codAmount: number;
  distance: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Assigned" | "Out for Delivery" | "Delivered";
  estimatedDeliveryTime: string;
}