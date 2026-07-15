export interface AvailablePickup {
  id: string;
  orderId: string;
  agentId?: string;
  agentName?: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  branch: string;
  parcelType: string;
  weight: string;
  paymentType: "Prepaid" | "COD";
  pickupFee: number;
  distance: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "Assigned" | "Accepted" | "Completed";
  requestedAt: string;
}