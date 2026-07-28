"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getOverview = async (userId) => {
    const agents = await prisma.deliveryAgent.findMany();
    // console.log(agents, "Find agent");
    // console.log("userId:", userId);
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });
    // console.log(user, "Agent user")
    const agent = await prisma.deliveryAgent.findUnique({
        where: {
            userId,
        },
        include: {
            user: true,
        },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const totalPickups = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
        },
    });
    const pendingPickups = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
            deliveryStatus: "PENDING",
        },
    });
    const totalDeliveries = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
        },
    });
    const pendingDeliveries = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
            deliveryStatus: "PENDING",
        },
    });
    const inProgressDeliveries = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
            deliveryStatus: "IN_PROGRESS",
        },
    });
    const completedDeliveries = await prisma.delivery.count({
        where: {
            assignedAgentId: agent.id,
            deliveryType: "DROP_OFF",
            deliveryStatus: "DELIVERIED",
        },
    });
    return {
        agentId: agent.id,
        employeeCode: agent.employeeCode,
        phone: agent.phone,
        status: agent.status,
        totalPickups,
        pendingPickups,
        totalDeliveries,
        pendingDeliveries,
        inProgressDeliveries,
        completedDeliveries,
    };
};
exports.getOverview = getOverview;
