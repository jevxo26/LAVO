export interface History {
  id: string;
  orderId: string;
  agentId: string;
  agentName: string;
  customerName: string;
  customerPhone: string;
  branch: string;
  serviceType: "Pickup" | "Delivery";
  parcelType: string;
  paymentType: "Prepaid" | "COD";
  amount: number;
  status: "Completed" | "Cancelled" | "Returned";
  completedAt: string;
}
