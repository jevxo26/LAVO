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

    return deliveries.map((delivery) => {
        const targetAddressId = delivery.deliveryAddressId || delivery.order?.deliveryAddressId;
        const address =
            delivery.customer?.addresses.find((a) => a.id === targetAddressId) ??
            delivery.customer?.addresses.find((a) => a.isDefault) ??
            delivery.customer?.addresses[0];

        return {
            deliveryId: delivery.id,
            orderId: delivery.order?.orderNumber || delivery.orderId,
            rawOrderId: delivery.orderId,
            customerName: address?.receiverName || delivery.customer?.user?.fullName || "N/A",
            customerPhone: address?.receiverPhone || delivery.customer?.user?.phone || "N/A",
            customerAddress: address?.fullAddress || "N/A",
            serviceType: delivery.order.orderType,
            branch: delivery.branch?.branchName ?? "N/A",
            amount: delivery.order.grandTotal,
            paymentStatus: delivery.order.paymentStatus,
            status: delivery.deliveryStatus,
            completedAt: delivery.completedAt,
        };
    });
};