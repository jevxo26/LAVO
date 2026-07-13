"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgent = exports.updateAgent = exports.createAgent = exports.getAllAgents = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllAgents = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { user: { fullName: { contains: search, mode: 'insensitive' } } },
                { employeeCode: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    const [agents, total] = await Promise.all([
        prisma.deliveryAgent.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.deliveryAgent.count({ where }),
    ]);
    const formattedAgents = agents.map(agent => {
        var _a;
        return ({
            id: agent.employeeCode,
            name: ((_a = agent.user) === null || _a === void 0 ? void 0 : _a.fullName) || 'Unknown',
            phone: agent.phone,
            zone: 'Default Zone', // Not directly tied in simple schema
            status: agent.status === 'ACTIVE' ? 'Active' : agent.status === 'PENDING' ? 'Pending' : 'Inactive',
        });
    });
    return {
        data: formattedAgents,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllAgents = getAllAgents;
const createAgent = async (data) => {
    const phone = data.phone || `017${Math.floor(Math.random() * 100000000)}`;
    if (await prisma.user.findUnique({ where: { phone } }))
        throw new Error('Agent already exists with this phone number');
    const newUser = await prisma.user.create({
        data: {
            fullName: data.name,
            email: `${Date.now()}@agent.com`,
            phone: phone,
            password: 'dummy_password',
            userType: 'DELIVERY_AGENT'
        }
    });
    const newAgent = await prisma.deliveryAgent.create({
        data: {
            userId: newUser.id,
            employeeCode: `AG-${Date.now()}`,
            phone: data.phone,
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        },
    });
    return newAgent;
};
exports.createAgent = createAgent;
const updateAgent = async (id, data) => {
    const agent = await prisma.deliveryAgent.findUnique({ where: { employeeCode: id } });
    if (!agent)
        throw new Error("Agent not found");
    if (data.name) {
        await prisma.user.update({
            where: { id: agent.userId },
            data: { fullName: data.name }
        });
    }
    const updated = await prisma.deliveryAgent.update({
        where: { employeeCode: id },
        data: {
            phone: data.phone,
            status: data.status ? data.status.toUpperCase() : undefined
        }
    });
    return updated;
};
exports.updateAgent = updateAgent;
const deleteAgent = async (id) => {
    return await prisma.deliveryAgent.delete({
        where: { employeeCode: id },
    });
};
exports.deleteAgent = deleteAgent;
