"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVendor = exports.updateVendor = exports.createVendor = exports.getAllVendors = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllVendors = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search ? { OR: [{ businessName: { contains: search, mode: 'insensitive' } }, { ownerName: { contains: search, mode: 'insensitive' } }, { vendorCode: { contains: search, mode: 'insensitive' } }] } : {};
    const [vendors, total] = await Promise.all([
        prisma.vendor.findMany({ where, skip, take: limit, include: { rating: true }, orderBy: { createdAt: 'desc' } }),
        prisma.vendor.count({ where }),
    ]);
    return {
        data: vendors.map(vendor => {
            var _a;
            return ({
                id: vendor.id, vendorName: vendor.businessName, owner: vendor.ownerName, commission: 10,
                rating: ((_a = vendor.rating) === null || _a === void 0 ? void 0 : _a.averageRating) || 0,
                status: vendor.status === 'ACTIVE' ? 'Active' : vendor.status === 'PENDING' ? 'Pending' : 'Inactive',
            });
        }),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllVendors = getAllVendors;
const createVendor = async (data) => {
    const newVendor = await prisma.vendor.create({
        data: { vendorCode: `VEN-${Date.now()}`, businessName: data.vendorName, ownerName: data.owner, email: `${Date.now()}@vendor.com`, phone: `${Date.now()}`, status: data.status ? data.status.toUpperCase() : 'ACTIVE' },
    });
    if (data.rating !== undefined)
        await prisma.vendorRating.create({ data: { vendorId: newVendor.id, averageRating: Number(data.rating) } });
    return newVendor;
};
exports.createVendor = createVendor;
const updateVendor = async (id, data) => {
    const updateData = {};
    if (data.vendorName)
        updateData.businessName = data.vendorName;
    if (data.owner)
        updateData.ownerName = data.owner;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.vendor.update({ where: { id }, data: updateData });
    if (data.rating !== undefined) {
        await prisma.vendorRating.upsert({
            where: { vendorId: id }, update: { averageRating: Number(data.rating) }, create: { vendorId: id, averageRating: Number(data.rating) }
        });
    }
    return updated;
};
exports.updateVendor = updateVendor;
const deleteVendor = async (id) => await prisma.vendor.delete({ where: { id } });
exports.deleteVendor = deleteVendor;
