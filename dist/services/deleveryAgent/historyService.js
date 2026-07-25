"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryHistory = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDeliveryHistory = async (userId) => {
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const targetAddressId = delivery.deliveryAddressId || ((_a = delivery.order) === null || _a === void 0 ? void 0 : _a.deliveryAddressId);
        const address = (_e = (_c = (_b = delivery.customer) === null || _b === void 0 ? void 0 : _b.addresses.find((a) => a.id === targetAddressId)) !== null && _c !== void 0 ? _c : (_d = delivery.customer) === null || _d === void 0 ? void 0 : _d.addresses.find((a) => a.isDefault)) !== null && _e !== void 0 ? _e : (_f = delivery.customer) === null || _f === void 0 ? void 0 : _f.addresses[0];
        return {
            deliveryId: delivery.id,
            orderId: ((_g = delivery.order) === null || _g === void 0 ? void 0 : _g.orderNumber) || delivery.orderId,
            rawOrderId: delivery.orderId,
            customerName: (address === null || address === void 0 ? void 0 : address.receiverName) || ((_j = (_h = delivery.customer) === null || _h === void 0 ? void 0 : _h.user) === null || _j === void 0 ? void 0 : _j.fullName) || "N/A",
            customerPhone: (address === null || address === void 0 ? void 0 : address.receiverPhone) || ((_l = (_k = delivery.customer) === null || _k === void 0 ? void 0 : _k.user) === null || _l === void 0 ? void 0 : _l.phone) || "N/A",
            customerAddress: (address === null || address === void 0 ? void 0 : address.fullAddress) || "N/A",
            serviceType: delivery.order.orderType,
            branch: (_o = (_m = delivery.branch) === null || _m === void 0 ? void 0 : _m.branchName) !== null && _o !== void 0 ? _o : "N/A",
            amount: delivery.order.grandTotal,
            paymentStatus: delivery.order.paymentStatus,
            status: delivery.deliveryStatus,
            completedAt: delivery.completedAt,
        };
    });
};
exports.getDeliveryHistory = getDeliveryHistory;
