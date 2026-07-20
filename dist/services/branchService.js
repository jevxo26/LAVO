"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranchById = exports.getAllBranches = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllBranches = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    // Construct the search query
    const where = search
        ? {
            OR: [
                { branchName: { contains: search, mode: 'insensitive' } },
                { branchCode: { contains: search, mode: 'insensitive' } },
            ],
        }
        : {};
    // Execute queries in a transaction for accuracy
    const [data, totalRecords] = await prisma.$transaction([
        prisma.branch.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.branch.count({ where }),
    ]);
    const totalPages = Math.ceil(totalRecords / limit);
    // Resolve managerId -> fullName via a single User lookup
    const managerIds = [...new Set(data.map((b) => b.managerId).filter(Boolean))];
    const managers = managerIds.length
        ? await prisma.user.findMany({
            where: { id: { in: managerIds } },
            select: { id: true, fullName: true },
        })
        : [];
    const managerMap = Object.fromEntries(managers.map((m) => [m.id, m.fullName]));
    // Map Prisma schema fields -> frontend-expected field names
    const mapped = data.map((b) => {
        var _a;
        return ({
            id: b.id,
            branchCode: b.branchCode,
            branchName: b.branchName,
            location: b.address || [b.city, b.country].filter(Boolean).join(', ') || null,
            manager: b.managerId ? ((_a = managerMap[b.managerId]) !== null && _a !== void 0 ? _a : b.managerId) : null,
            contact: b.phone || null,
            status: b.status,
        });
    });
    return {
        data: mapped,
        meta: {
            totalRecords,
            totalPages,
            currentPage: page,
            limit,
        },
    };
};
exports.getAllBranches = getAllBranches;
const getBranchById = async (id) => {
    return await prisma.branch.findUnique({
        where: { id },
    });
};
exports.getBranchById = getBranchById;
const createBranch = async (data) => {
    return await prisma.branch.create({
        data: {
            branchCode: data.branchCode || `BR-${Date.now()}`,
            branchName: data.branchName,
            branchType: data.branchType || 'Standard',
            country: data.country || 'Bangladesh',
            city: data.city || 'Dhaka',
            address: data.location || data.address || '',
            phone: data.contact || data.phone || '',
            email: data.email || null,
            managerId: data.managerId || data.manager || null,
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        },
    });
};
exports.createBranch = createBranch;
const updateBranch = async (id, data) => {
    const updateData = {};
    if (data.branchName)
        updateData.branchName = data.branchName;
    if (data.location)
        updateData.address = data.location;
    if (data.manager)
        updateData.managerId = data.manager;
    if (data.contact)
        updateData.phone = data.contact;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    return await prisma.branch.update({
        where: { id },
        data: updateData,
    });
};
exports.updateBranch = updateBranch;
const deleteBranch = async (id) => {
    return await prisma.branch.delete({
        where: { id },
    });
};
exports.deleteBranch = deleteBranch;
