export interface Verification {
  id: string;
  orderId: string;
  agentId: string;
  agentName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  otp: string;
  verificationStatus: "Pending" | "Verified" | "Failed" | "Expired";
  deliveryStatus: "Out for Delivery" | "Delivered";
  verifiedAt: string | null;
}