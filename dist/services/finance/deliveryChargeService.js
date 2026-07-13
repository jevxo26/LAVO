"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeliveryCharge = exports.updateDeliveryCharge = exports.createDeliveryCharge = exports.getAllDeliveryCharges = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllDeliveryCharges = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { ruleName: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    const [charges, total] = await Promise.all([
        prisma.deliveryChargeRule.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.deliveryChargeRule.count({ where }),
    ]);
    const formattedCharges = charges.map(charge => ({
        id: charge.id,
        ruleName: charge.ruleName,
        zone: 'Global',
        charge: charge.baseCharge,
        status: charge.status === 'ACTIVE' ? 'Active' : 'Inactive',
    }));
    return {
        data: formattedCharges,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllDeliveryCharges = getAllDeliveryCharges;
const createDeliveryCharge = async (data) => {
    const newCharge = await prisma.deliveryChargeRule.create({
        data: {
            ruleName: data.ruleName,
            baseCharge: Number(data.charge || 0),
            distanceCharge: 0,
            weightCharge: 0,
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        },
    });
    return newCharge;
};
exports.createDeliveryCharge = createDeliveryCharge;
const updateDeliveryCharge = async (id, data) => {
    const updateData = {};
    if (data.ruleName)
        updateData.ruleName = data.ruleName;
    if (data.charge)
        updateData.baseCharge = Number(data.charge);
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.deliveryChargeRule.update({
        where: { id },
        data: updateData,
    });
    return updated;
};
exports.updateDeliveryCharge = updateDeliveryCharge;
const deleteDeliveryCharge = async (id) => {
    return await prisma.deliveryChargeRule.delete({
        where: { id },
    });
};
exports.deleteDeliveryCharge = deleteDeliveryCharge;
