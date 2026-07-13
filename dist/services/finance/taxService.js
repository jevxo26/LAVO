"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTax = exports.updateTax = exports.createTax = exports.getAllTaxes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTaxes = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { taxName: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    const [taxes, total] = await Promise.all([
        prisma.taxRule.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.taxRule.count({ where }),
    ]);
    const formattedTaxes = taxes.map(tax => ({
        id: tax.id,
        ruleName: tax.taxName,
        region: tax.country || 'Global',
        rate: tax.taxPercentage,
        status: tax.status === 'ACTIVE' ? 'Active' : 'Inactive',
    }));
    return {
        data: formattedTaxes,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllTaxes = getAllTaxes;
const createTax = async (data) => {
    const newTax = await prisma.taxRule.create({
        data: {
            taxName: data.ruleName,
            country: data.region || 'Global',
            taxPercentage: Number(data.rate || 0),
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        },
    });
    return newTax;
};
exports.createTax = createTax;
const updateTax = async (id, data) => {
    const updateData = {};
    if (data.ruleName)
        updateData.taxName = data.ruleName;
    if (data.region)
        updateData.country = data.region;
    if (data.rate)
        updateData.taxPercentage = Number(data.rate);
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.taxRule.update({
        where: { id },
        data: updateData,
    });
    return updated;
};
exports.updateTax = updateTax;
const deleteTax = async (id) => {
    return await prisma.taxRule.delete({
        where: { id },
    });
};
exports.deleteTax = deleteTax;
