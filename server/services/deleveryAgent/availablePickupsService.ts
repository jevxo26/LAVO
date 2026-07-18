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

    // test
    const allDeliveries = await prisma.delivery.findMany({
        select: {
            id: true,
            orderId: true,
            assignedAgentId: true,
            deliveryType: true,
            deliveryStatus: true,
            customerId: true,
            branchId: true,
            createdAt: true,
        },
    });

    console.log("===== ALL DELIVERIES =====");
    console.table(allDeliveries);
    const allOrders = await prisma.order.findMany({
        select: {
            id: true,
            customerId: true,
            deliveryAgentId: true,
            pickupAgentId: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
        },
    });
    console.log("All order")

    console.table(allOrders);

    console.log("===== ALL ORDERS =====");
    console.table(allOrders);

    const myOrders = await prisma.order.findMany({
        where: {
            deliveryAgentId: agent.id,
        },
        include: {
            customer: {
                include: {
                    user: true,
                    addresses: true
                }
            }
        }
    });


    console.log("My Orders");
    console.table(myOrders);


    // const pickups = await prisma.delivery.findMany({
    //     where: {
    //         assignedAgentId: agent.id,
    //         deliveryType: "PICKUP",
    //         deliveryStatus: "PENDING"
    //     },
    //     include: {
    //         customer: {
    //             include: {
    //                 user: true,
    //                 addresses: true
    //             }
    //         },
    //         branch: true,
    //         order: true
    //     },
    //     orderBy: {
    //         createdAt: "desc"
    //     }
    // });

    const pickups = await prisma.delivery.findMany({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "PICKUP",
            deliveryStatus: "PENDING"
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
    console.log("Agent ID:", agent.id);
    console.log("Pickups:", pickups);

    return pickups.map((pickup) => {
        const customerAddress =
            pickup.customer.addresses.find(
                (addr) => addr.isDefault
            ) || pickup.customer.addresses[0];
        let distance = null;
        if (
            pickup.branch?.latitude &&
            pickup.branch?.longitude &&
            customerAddress?.latitude &&
            customerAddress?.longitude
        ) {
            distance = calculateDistance(
                pickup.branch.latitude,
                pickup.branch.longitude,
                customerAddress.latitude,
                customerAddress.longitude
            );
        }
        return {

            id: pickup.id,
            orderId: pickup.orderId,
            customerName: pickup.customer?.user?.fullName,
            customerPhone: pickup.customer?.user?.phone,
            branch: pickup.branch?.branchName ?? "N/A",

            pickupAddress: customerAddress?.fullAddress,
            distance: distance
                ? `${distance} KM`
                : "N/A",

            priority: "NORMAL",
            status: pickup.deliveryStatus,
            createdAt: pickup.createdAt
        }
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
    return updatedDelivery;
};