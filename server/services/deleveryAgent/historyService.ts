import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDeliveryHistory = async (userId: string) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
    });

    if (!agent) {
        throw new Error("Delivery agent not found");
    }

    const deliveries = await prisma.delivery.findMany({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
            deliveryStatus: "DELIVERED",
        },
        include: {
            customer: {
                include: {
                    user: true,
                    addresses: true,
                },
            },
            branch: true,
            order: true,
        },
        orderBy: {
            completedAt: "desc",
        },
    });

    return deliveries.map((delivery) => ({
        deliveryId: delivery.id,
        orderId: delivery.orderId,
        customerName: delivery.customer?.user?.fullName || delivery.customer?.addresses?.[0]?.receiverName || "N/A",
        customerPhone: delivery.customer?.user?.phone || delivery.customer?.addresses?.[0]?.receiverPhone || "N/A",
        serviceType: delivery.order.orderType,
        branch: delivery.branch?.branchName ?? "N/A",
        amount: delivery.order.grandTotal,
        paymentStatus: delivery.order.paymentStatus,
        status: delivery.deliveryStatus,
        completedAt: delivery.completedAt,
    }));
};