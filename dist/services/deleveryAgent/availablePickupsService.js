"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPickupQRCodes = exports.acceptPickup = exports.getAvailablePickups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const geoUtils_1 = require("../../utils/geoUtils");
const getAvailablePickups = async (userId) => {
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
            deliveryType: "PICKUP",
            // Only show pickups whose order is still waiting for pickup
            order: {
                orderStatus: { in: ["PENDING", "CONFIRMED"] }
            },
            OR: [
                // Unassigned pickups for this branch — any agent can claim these
                {
                    branchId: agent.branchId,
                    assignedAgentId: null,
                    deliveryStatus: "PENDING",
                },
                // Already assigned to this agent and still active
                {
                    assignedAgentId: agent.id,
                    deliveryStatus: {
                        in: ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"]
                    }
                }
            ]
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const customerAddress = ((_a = delivery.customer) === null || _a === void 0 ? void 0 : _a.addresses.find(addr => addr.isDefault)) || ((_b = delivery.customer) === null || _b === void 0 ? void 0 : _b.addresses[0]);
        let distance = null;
        if (((_c = delivery.branch) === null || _c === void 0 ? void 0 : _c.latitude) &&
            ((_d = delivery.branch) === null || _d === void 0 ? void 0 : _d.longitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude)) {
            distance = (0, geoUtils_1.calculateDistance)(delivery.branch.latitude, delivery.branch.longitude, customerAddress.latitude, customerAddress.longitude);
        }
        return {
            id: delivery.id,
            orderId: delivery.orderId,
            deliveryType: delivery.deliveryType,
            customerName: (_g = (_f = (_e = delivery.customer) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.fullName) !== null && _g !== void 0 ? _g : "N/A",
            customerPhone: (_k = (_j = (_h = delivery.customer) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.phone) !== null && _k !== void 0 ? _k : "N/A",
            branch: (_m = (_l = delivery.branch) === null || _l === void 0 ? void 0 : _l.branchName) !== null && _m !== void 0 ? _m : "N/A",
            pickupAddress: (_o = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress) !== null && _o !== void 0 ? _o : "N/A",
            distance: distance ? `${distance} KM` : "N/A",
            priority: "NORMAL",
            status: delivery.deliveryStatus,
            createdAt: delivery.createdAt
        };
    });
};
exports.getAvailablePickups = getAvailablePickups;
const acceptPickup = async (userId, deliveryId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId
        }
    });
    if (!agent) {
        throw new Error("Agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: deliveryId
        }
    });
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    if (delivery.assignedAgentId !== null && delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery has already been accepted by another agent.");
    }
    const updatedDelivery = await prisma.$transaction(async (tx) => {
        // 1. Mark delivery as ACCEPTED
        const updated = await tx.delivery.update({
            where: { id: deliveryId },
            data: {
                assignedAgentId: agent.id,
                deliveryStatus: "IN_PROGRESS"
            }
        });
        // 2. Advance the order status to CONFIRMED so the customer tracking page moves forward
        await tx.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: "CONFIRMED" }
        });
        // 3. Add a timeline entry for the customer
        await tx.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: "CONFIRMED",
                description: "A pickup agent is on the way to collect your garments.",
            }
        });
        // 4. Generate a pickup verification OTP (agent presents to customer at pickup)
        const existingOtp = await tx.deliveryOTP.findFirst({
            where: {
                deliveryId: delivery.id,
                isUsed: false,
                expiresAt: { gt: new Date() }
            }
        });
        if (!existingOtp) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            await tx.deliveryOTP.create({
                data: {
                    deliveryId: delivery.id,
                    otpCode: otp.toString(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                }
            });
        }
        return updated;
    });
    console.log("ACCEPTED PICKUP DELIVERY:", updatedDelivery);
    return updatedDelivery;
};
exports.acceptPickup = acceptPickup;
const getPickupQRCodes = async (userId, deliveryId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: { userId },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: deliveryId,
            assignedAgentId: agent.id,
        },
        include: {
            order: {
                include: {
                    items: {
                        include: {
                            garmentItems: {
                                include: {
                                    qrCodeRecord: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!delivery) {
        throw new Error("Delivery not found or not assigned to you");
    }
    const garmentItems = delivery.order.items.flatMap((oi) => oi.garmentItems);
    return garmentItems.map((gi) => {
        var _a;
        return ({
            garmentId: gi.id,
            garmentName: gi.garmentName,
            qrCode: ((_a = gi.qrCodeRecord) === null || _a === void 0 ? void 0 : _a.qrCode) || null,
            status: gi.status,
        });
    });
};
exports.getPickupQRCodes = getPickupQRCodes;
