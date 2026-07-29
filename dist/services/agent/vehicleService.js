"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVehicle = exports.updateVehicle = exports.createVehicle = exports.getAllVehicles = void 0;
const client_1 = require("@prisma/client");
const agentService_1 = require("./agentService");
const prisma = new client_1.PrismaClient();
const getAllVehicles = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { vehicleNumber: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    const [vehicles, total] = await Promise.all([
        prisma.deliveryVehicle.findMany({
            where,
            skip,
            take: limit,
            include: {
                agent: {
                    include: { user: true }
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.deliveryVehicle.count({ where }),
    ]);
    const formattedVehicles = vehicles.map(vehicle => {
        var _a, _b;
        return ({
            id: vehicle.id,
            vehicleNumber: vehicle.vehicleNumber,
            type: vehicle.vehicleType,
            assignedAgent: ((_b = (_a = vehicle.agent) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || 'Unassigned',
            status: vehicle.status === 'ACTIVE' ? 'Active' : vehicle.status === 'MAINTENANCE' ? 'Maintenance' : 'Inactive',
        });
    });
    return {
        data: formattedVehicles,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllVehicles = getAllVehicles;
const createVehicle = async (data) => {
    // Find or create dummy agent
    let agent = await prisma.deliveryAgent.findFirst();
    if (!agent) {
        agent = await (0, agentService_1.createAgent)({ name: data.assignedAgent || 'Default Agent', phone: `017${Math.floor(Math.random() * 100000000)}` });
    }
    if (data.vehicleNumber) {
        const existing = await prisma.deliveryVehicle.findUnique({ where: { vehicleNumber: data.vehicleNumber } });
        if (existing)
            throw new Error('Vehicle already exists with this number');
    }
    const newVehicle = await prisma.deliveryVehicle.create({
        data: {
            agentId: agent.id,
            vehicleType: data.type || 'Bike',
            vehicleNumber: data.vehicleNumber,
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        },
    });
    return newVehicle;
};
exports.createVehicle = createVehicle;
const updateVehicle = async (id, data) => {
    const updateData = {};
    if (data.vehicleNumber)
        updateData.vehicleNumber = data.vehicleNumber;
    if (data.type)
        updateData.vehicleType = data.type;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.deliveryVehicle.update({
        where: { id },
        data: updateData,
    });
    return updated;
};
exports.updateVehicle = updateVehicle;
const deleteVehicle = async (id) => {
    return await prisma.deliveryVehicle.delete({
        where: { id },
    });
};
exports.deleteVehicle = deleteVehicle;
