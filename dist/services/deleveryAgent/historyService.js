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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return ({
            deliveryId: delivery.id,
            orderId: delivery.orderId,
            customerName: ((_b = (_a = delivery.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || ((_e = (_d = (_c = delivery.customer) === null || _c === void 0 ? void 0 : _c.addresses) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.receiverName) || "N/A",
            customerPhone: ((_g = (_f = delivery.customer) === null || _f === void 0 ? void 0 : _f.user) === null || _g === void 0 ? void 0 : _g.phone) || ((_k = (_j = (_h = delivery.customer) === null || _h === void 0 ? void 0 : _h.addresses) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.receiverPhone) || "N/A",
            serviceType: delivery.order.orderType,
            branch: (_m = (_l = delivery.branch) === null || _l === void 0 ? void 0 : _l.branchName) !== null && _m !== void 0 ? _m : "N/A",
            amount: delivery.order.grandTotal,
            paymentStatus: delivery.order.paymentStatus,
            status: delivery.deliveryStatus,
            completedAt: delivery.completedAt,
        });
    });
};
exports.getDeliveryHistory = getDeliveryHistory;
