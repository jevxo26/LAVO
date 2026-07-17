import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getOptimizedRoutes = async (
  userId: string
) => {
  const agent =
    await prisma.deliveryAgent.findUnique({
      where: { userId },
    });

  if (!agent) {
    throw new Error("Delivery agent not found");
  }

  const routes =
    await prisma.pickupRoute.findMany({
      where: {
        agentId: agent.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return routes.map((route) => ({
    id: route.id,
    routeName: route.routeName,
    startLocation: "Branch",
    endLocation: "Customer",
    totalStops: route.totalStops,
    totalDistance: `${route.totalDistance} KM`,
    estimatedTime:
      route.estimatedDuration ?? "N/A",
    pickups: 0,
    deliveries: 0,
    status: route.routeStatus,
  }));
};