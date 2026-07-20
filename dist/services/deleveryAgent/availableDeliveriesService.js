"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptDelivery = exports.getAvailableDeliveries = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
};
const getAvailableDeliveries = async (userId) => {
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
            deliveryType: "DROP_OFF",
            // Only show drop-offs whose order is actually ready
            order: {
                orderStatus: { in: ["READY_FOR_DELIVERY", "DELIVERY"] }
            },
            OR: [
                // Unassigned drop-offs for this branch — any agent can claim these
                {
                    branchId: agent.branchId,
                    assignedAgentId: null,
                    deliveryStatus: "PENDING",
                },
                // Already assigned to this agent and still active
                {
                    assignedAgentId: agent.id,
                    deliveryStatus: {
                        in: ["PENDING", "ASSIGNED", "ACCEPTED", "IN_PROGRESS"],
                    },
                }
            ]
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
            createdAt: "desc",
        },
    });
    // console.log("Total deliveries:", deliveries.length);
    // console.log(deliveries);
    return deliveries.map((delivery) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const customerAddress = delivery.customer.addresses.find((addr) => addr.isDefault) || delivery.customer.addresses[0];
        let distance = null;
        if (((_a = delivery.branch) === null || _a === void 0 ? void 0 : _a.latitude) &&
            ((_b = delivery.branch) === null || _b === void 0 ? void 0 : _b.longitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude)) {
            distance = calculateDistance(delivery.branch.latitude, delivery.branch.longitude, customerAddress.latitude, customerAddress.longitude);
        }
        return {
            id: delivery.id,
            orderId: delivery.orderId,
            customerName: delivery.customer.user.fullName,
            customerPhone: delivery.customer.user.phone,
            branch: (_d = (_c = delivery.branch) === null || _c === void 0 ? void 0 : _c.branchName) !== null && _d !== void 0 ? _d : "N/A",
            deliveryAddress: (_e = customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress) !== null && _e !== void 0 ? _e : "N/A",
            // Order model ->
            parcelType: (_g = (_f = delivery.order) === null || _f === void 0 ? void 0 : _f.orderType) !== null && _g !== void 0 ? _g : "N/A",
            paymentType: (_j = (_h = delivery.order) === null || _h === void 0 ? void 0 : _h.paymentStatus) !== null && _j !== void 0 ? _j : "N/A",
            //  schema-N/A
            weight: "N/A",
            // COD amount = grandTotal
            codAmount: (_l = (_k = delivery.order) === null || _k === void 0 ? void 0 : _k.grandTotal) !== null && _l !== void 0 ? _l : 0,
            distance: distance
                ? `${distance} KM`
                : "N/A",
            priority: "NORMAL",
            status: delivery.deliveryStatus,
            createdAt: delivery.createdAt,
        };
    });
};
exports.getAvailableDeliveries = getAvailableDeliveries;
const acceptDelivery = async (userId, deliveryId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const delivery = await prisma.delivery.findUnique({
        where: {
            id: deliveryId,
        },
    });
    if (!delivery) {
        throw new Error("Delivery not found");
    }
    // Allow self-assignment: if unassigned, this agent claims it.
    // If already assigned to someone else, block it.
    if (delivery.assignedAgentId && delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery has already been claimed by another agent");
    }
    if (delivery.deliveryStatus === "IN_PROGRESS") {
        throw new Error("Delivery already started");
    }
    const updatedDelivery = await prisma.$transaction(async (tx) => {
        const updated = await tx.delivery.update({
            where: {
                id: deliveryId,
            },
            data: {
                assignedAgentId: agent.id, // self-assign if not already assigned
                deliveryStatus: "IN_PROGRESS",
            },
        });
        // Advance the order to OUT FOR DELIVERY
        await tx.order.update({
            where: { id: delivery.orderId },
            data: { orderStatus: "DELIVERY" }
        });
        await tx.orderTimeline.create({
            data: {
                orderId: delivery.orderId,
                status: "DELIVERY",
                description: "Your clean laundry is out for delivery and on the way to you!",
            }
        });
        const existingOtp = await tx.deliveryOTP.findFirst({
            where: {
                deliveryId: delivery.id,
                isUsed: false,
                expiresAt: {
                    gt: new Date()
                }
            },
        });
        if (!existingOtp) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            await tx.deliveryOTP.create({
                data: {
                    deliveryId: delivery.id,
                    otpCode: otp.toString(),
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                },
            });
            console.log("Delivery OTP:", otp);
        }
        return updated;
    });
    return updatedDelivery;
};
exports.acceptDelivery = acceptDelivery;
