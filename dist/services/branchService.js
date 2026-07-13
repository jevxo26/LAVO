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
            orderBy: { createdAt: 'desc' }
        }),
        prisma.branch.count({ where })
    ]);
    const totalPages = Math.ceil(totalRecords / limit);
    return {
        data,
        meta: {
            totalRecords,
            totalPages,
            currentPage: page,
            limit
        }
    };
};
exports.getAllBranches = getAllBranches;
const getBranchById = async (id) => {
    return await prisma.branch.findUnique({
        where: { id }
    });
};
exports.getBranchById = getBranchById;
const createBranch = async (data) => {
    return await prisma.branch.create({
        data: {
            branchCode: data.id || `BR-${Date.now()}`,
            branchName: data.branchName,
            branchType: 'Standard',
            country: 'Bangladesh',
            city: 'Dhaka',
            address: 'Dummy Address',
            phone: data.contact,
            status: data.status ? data.status.toUpperCase() : 'ACTIVE',
        }
    });
};
exports.createBranch = createBranch;
const updateBranch = async (id, data) => {
    const updateData = {};
    if (data.branchName)
        updateData.branchName = data.branchName;
    if (data.contact)
        updateData.phone = data.contact;
    if (data.status)
        updateData.status = data.status.toUpperCase();
    return await prisma.branch.update({
        where: { id },
        data: updateData
    });
};
exports.updateBranch = updateBranch;
const deleteBranch = async (id) => {
    // Typically you'd do a soft delete, but for this basic CRUD we'll physically delete
    return await prisma.branch.delete({
        where: { id }
    });
};
exports.deleteBranch = deleteBranch;
