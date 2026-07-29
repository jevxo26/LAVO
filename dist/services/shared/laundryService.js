"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getAllServices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllServices = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search ? { OR: [{ serviceName: { contains: search, mode: 'insensitive' } }] } : {};
    const [services, total] = await Promise.all([
        prisma.service.findMany({
            where, skip, take: limit,
            include: { garmentType: { include: { category: true } }, pricings: true },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.service.count({ where }),
    ]);
    return {
        data: services.map(service => {
            var _a, _b;
            return ({
                id: service.id, itemName: service.serviceName, category: ((_b = (_a = service.garmentType) === null || _a === void 0 ? void 0 : _a.category) === null || _b === void 0 ? void 0 : _b.name) || 'General',
                washPrice: service.basePrice || 50, dryCleanPrice: (service.basePrice || 50) * 2,
                status: service.status === 'ACTIVE' ? 'Active' : service.status === 'PENDING' ? 'Pending' : 'Inactive',
            });
        }),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllServices = getAllServices;
const createService = async (data) => {
    let category = await prisma.garmentCategory.findFirst({ where: { name: data.category || 'General' } });
    if (!category)
        category = await prisma.garmentCategory.create({ data: { name: data.category || 'General' } });
    let garmentType = await prisma.garmentType.findFirst({ where: { categoryId: category.id } });
    if (!garmentType)
        garmentType = await prisma.garmentType.create({ data: { categoryId: category.id, name: 'Standard', unitType: 'PIECE' } });
    let serviceCat = await prisma.serviceCategory.findFirst();
    if (!serviceCat)
        serviceCat = await prisma.serviceCategory.create({ data: { name: 'Standard Cleaning' } });
    return await prisma.service.create({
        data: { serviceName: data.itemName, serviceCategoryId: serviceCat.id, garmentTypeId: garmentType.id, basePrice: Number(data.washPrice || 0), status: data.status ? data.status.toUpperCase() : 'ACTIVE' },
    });
};
exports.createService = createService;
const updateService = async (id, data) => {
    const updateData = {};
    if (data.itemName)
        updateData.serviceName = data.itemName;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    if (data.washPrice)
        updateData.basePrice = Number(data.washPrice);
    return await prisma.service.update({ where: { id }, data: updateData });
};
exports.updateService = updateService;
const deleteService = async (id) => await prisma.service.delete({ where: { id } });
exports.deleteService = deleteService;
