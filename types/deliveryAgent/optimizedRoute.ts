export interface OptimizedRoute {
  id: string;
  agentId: string;
  agentName: string;
  routeName: string;
  startLocation: string;
  endLocation: string;
  totalStops: number;
  totalDistance: string;
  estimatedTime: string;
  pickups: number;
  deliveries: number;
  status: "Assigned" | "In Progress" | "Completed";
}