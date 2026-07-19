import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return Number((R * c).toFixed(2));
};

export const getAvailablePickups = async (userId: string) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId
        }
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const deliveries = await prisma.delivery.findMany({
        where: {
            assignedAgentId: agent.id,
            deliveryStatus: "PENDING",
        },
        include: {
            order: true,
            customer: {
                include: {
                    user: true,
                    addresses: true
                }
            },
            branch: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    // console.log("Agent ID:", agent.id);
    // console.log(
    //     "Assigned Deliveries:",
    //     deliveries.map(d => ({
    //         id: d.id,
    //         type: d.deliveryType,
    //         status: d.deliveryStatus
    //     }))
    // );
    return deliveries.map((delivery) => {
        const customerAddress =
            delivery.customer?.addresses.find(
                addr => addr.isDefault
            ) || delivery.customer?.addresses[0];
        let distance = null;
        if (
            delivery.branch?.latitude &&
            delivery.branch?.longitude &&
            customerAddress?.latitude &&
            customerAddress?.longitude
        ) {
            distance = calculateDistance(
                delivery.branch.latitude,
                delivery.branch.longitude,
                customerAddress.latitude,
                customerAddress.longitude
            );
        }
        return {
            id: delivery.id,
            orderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName:
                delivery.customer?.user?.fullName ?? "N/A",
            customerPhone:
                delivery.customer?.user?.phone ?? "N/A",
            branch:
                delivery.branch?.branchName ?? "N/A",
            pickupAddress:
                customerAddress?.fullAddress ?? "N/A",
            distance:
                distance ? `${distance} KM` : "N/A",
            priority: "NORMAL",
            status:
                delivery.deliveryStatus,
            createdAt:
                delivery.createdAt
        };
    });
};
export const acceptPickup = async (
    userId: string,
    deliveryId: string
) => {
    const agent =
        await prisma.deliveryAgent.findUnique({
            where: {
                userId
            }
        });

    if (!agent) {
        throw new Error(
            "Agent not found"
        );
    }

    const delivery =
        await prisma.delivery.findUnique({
            where: {
                id: deliveryId
            }
        });

    if (!delivery) {
        throw new Error(
            "Delivery not found"
        );
    }

    const updatedDelivery =
        await prisma.delivery.update({
            where: {
                id: deliveryId
            },
            data: {
                assignedAgentId: agent.id,
                deliveryStatus: "ACCEPTED"
            }
        });
        console.log("ACCEPTED DELIVERY:", updatedDelivery);
    return updatedDelivery;
};