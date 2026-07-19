import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getOptimizedRoutes = async (
  userId: string
) => {
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId },
  });

  if (!agent) {
    throw new Error("Delivery agent not found");
  }

  const deliveries = await prisma.delivery.findMany({
    where: {
      assignedAgentId: agent.id,
      deliveryType: "DROP_OFF",
      deliveryStatus: {
        in: ["PENDING", "ACCEPTED", "IN_PROGRESS", "DELIVERIED"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const routes = await Promise.all(
    deliveries.map(async (delivery, index) => {
      const address = await prisma.customerAddress.findUnique({
        where: {
          id: delivery.deliveryAddressId,
        },
      });

      return {
        id: delivery.id,
        routeName: `Route ${index + 1}`,
        startLocation: "Branch",
        endLocation: address?.fullAddress ?? "Customer",
        
        latitude: address?.latitude ?? null,
        longitude: address?.longitude ?? null,
        
        totalStops: 1,
        totalDistance: "N/A",
        estimatedTime: "N/A",
        pickups: 0,
        deliveries: 1,
        status: delivery.deliveryStatus,
      };
    })
  );

  return routes;
};