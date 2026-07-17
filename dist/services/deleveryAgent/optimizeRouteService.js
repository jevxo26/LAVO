"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedRoutes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getOptimizedRoutes = async (userId) => {
    const agent = await prisma.deliveryAgent.findUnique({
        where: { userId },
    });
    if (!agent) {
        throw new Error("Delivery agent not found");
    }
    const routes = await prisma.pickupRoute.findMany({
        where: {
            agentId: agent.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return routes.map((route) => {
        var _a;
        return ({
            id: route.id,
            routeName: route.routeName,
            startLocation: "Branch",
            endLocation: "Customer",
            totalStops: route.totalStops,
            totalDistance: `${route.totalDistance} KM`,
            estimatedTime: (_a = route.estimatedDuration) !== null && _a !== void 0 ? _a : "N/A",
            pickups: 0,
            deliveries: 0,
            status: route.routeStatus,
        });
    });
};
exports.getOptimizedRoutes = getOptimizedRoutes;
