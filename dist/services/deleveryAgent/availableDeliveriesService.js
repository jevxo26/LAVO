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
            assignedAgentId: agent.id,
            deliveryType: "DELIVERY",
            deliveryStatus: "PENDING",
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
    if (delivery.assignedAgentId !== agent.id) {
        throw new Error("This delivery is not assigned to you");
    }
    return prisma.delivery.update({
        where: {
            id: deliveryId,
        },
        data: {
            deliveryStatus: "IN_PROGRESS",
            //   acceptedAt: new Date(),
        },
    });
};
exports.acceptDelivery = acceptDelivery;
