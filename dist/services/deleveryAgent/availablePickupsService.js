"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptPickup = exports.getAvailablePickups = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
};
const getAvailablePickups = async (userId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId
        }
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const pickups = await prisma.delivery.findMany({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "PICKUP",
            deliveryStatus: "PENDING"
        },
        include: {
            customer: {
                include: {
                    user: true,
                    addresses: true
                }
            },
            branch: true,
            order: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    return pickups.map((pickup) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const customerAddress = pickup.customer.addresses.find((addr) => addr.isDefault) || pickup.customer.addresses[0];
        let distance = null;
        if (((_a = pickup.branch) === null || _a === void 0 ? void 0 : _a.latitude) &&
            ((_b = pickup.branch) === null || _b === void 0 ? void 0 : _b.longitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.latitude) &&
            (customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.longitude)) {
            distance = calculateDistance(pickup.branch.latitude, pickup.branch.longitude, customerAddress.latitude, customerAddress.longitude);
        }
        return {
            id: pickup.id,
            orderId: pickup.orderId,
            customerName: (_d = (_c = pickup.customer) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.fullName,
            customerPhone: (_f = (_e = pickup.customer) === null || _e === void 0 ? void 0 : _e.user) === null || _f === void 0 ? void 0 : _f.phone,
            branch: (_h = (_g = pickup.branch) === null || _g === void 0 ? void 0 : _g.branchName) !== null && _h !== void 0 ? _h : "N/A",
            pickupAddress: customerAddress === null || customerAddress === void 0 ? void 0 : customerAddress.fullAddress,
            distance: distance
                ? `${distance} KM`
                : "N/A",
            priority: "NORMAL",
            status: pickup.deliveryStatus,
            createdAt: pickup.createdAt
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
    const updatedDelivery = await prisma.delivery.update({
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
exports.acceptPickup = acceptPickup;
