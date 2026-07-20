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
        var _a, _b;
        return ({
            deliveryId: delivery.id,
            orderId: delivery.orderId,
            customerName: delivery.customer.user.fullName,
            customerPhone: delivery.customer.user.phone,
            serviceType: delivery.order.orderType,
            branch: (_b = (_a = delivery.branch) === null || _a === void 0 ? void 0 : _a.branchName) !== null && _b !== void 0 ? _b : "N/A",
            amount: delivery.order.grandTotal,
            paymentStatus: delivery.order.paymentStatus,
            status: delivery.deliveryStatus,
            completedAt: delivery.completedAt,
        });
    });
};
exports.getDeliveryHistory = getDeliveryHistory;
