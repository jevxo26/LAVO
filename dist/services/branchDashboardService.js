"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderCounts = exports.getBranchOrFail = exports.getBranchId = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getBranchId = async (req) => {
    var _a, _b, _c, _d;
    const branchId = req.query.branchId;
    if (branchId)
        return branchId;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'BRANCH_MANAGER' || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === 'Branch Manager') {
        const branch = await prisma.branch.findFirst({
            where: { managerId: req.user.userId || req.user.id }
        });
        return (branch === null || branch === void 0 ? void 0 : branch.id) || null;
    }
    // Fallback for SUPER_ADMIN or Admin so the dashboard loads
    if (['SUPER_ADMIN', 'Admin'].includes((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) || ['SUPER_ADMIN', 'Admin'].includes((_d = req.user) === null || _d === void 0 ? void 0 : _d.userType)) {
        const defaultBranch = await prisma.branch.findFirst();
        return (defaultBranch === null || defaultBranch === void 0 ? void 0 : defaultBranch.id) || null;
    }
    return null;
};
exports.getBranchId = getBranchId;
const getBranchOrFail = async (req) => {
    const branchId = await (0, exports.getBranchId)(req);
    if (!branchId)
        throw new Error('Branch ID not found or unauthorized');
    return branchId;
};
exports.getBranchOrFail = getBranchOrFail;
const getOrderCounts = async (branchId) => {
    const pending = await prisma.order.count({
        where: { branchId, orderStatus: 'PENDING' }
    });
    const active = await prisma.order.count({
        where: {
            branchId,
            orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] }
        }
    });
    return { pending, active };
};
exports.getOrderCounts = getOrderCounts;
exports.default = prisma;
