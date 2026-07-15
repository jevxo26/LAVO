export interface Overview {
  id: string;
  agentId: string;
  agentName: string;
  branch: string;
  date: string;
  pendingPickups: number;
  pendingDeliveries: number;
  completedPickups: number;
  completedDeliveries: number;
  totalOrders: number;
  earnings: number;
  rating: number;
  status: "Active" | "Available" | "On Delivery" | "Offline";
}