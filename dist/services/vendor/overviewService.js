"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = exports.getVendorByUserId = void 0;
const prisma_1 = __importDefault(require("./prisma"));
// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Resolve the Vendor record from the JWT user id.
 * Vendors are stored with the same email as their User account.
 */
const getVendorByUserId = async (userId) => {
    const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    const vendor = await prisma_1.default.vendor.findUnique({ where: { email: user.email } });
    if (!vendor)
        throw new Error('Vendor profile not found for this user');
    return vendor;
};
exports.getVendorByUserId = getVendorByUserId;
// ── Service ───────────────────────────────────────────────────────────────────
const getOverview = async (userId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const vendor = await (0, exports.getVendorByUserId)(userId);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeStatuses = ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING'];
    const [totalOrders, activeOrders, completedOrders, todayOrders, wallet, performance, rating, assignment,] = await Promise.all([
        prisma_1.default.order.count({ where: { vendorId: vendor.id } }),
        prisma_1.default.order.count({
            where: { vendorId: vendor.id, orderStatus: { in: activeStatuses } },
        }),
        prisma_1.default.order.count({
            where: { vendorId: vendor.id, orderStatus: 'COMPLETED' },
        }),
        prisma_1.default.order.count({
            where: { vendorId: vendor.id, createdAt: { gte: todayStart } },
        }),
        prisma_1.default.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
        prisma_1.default.vendorPerformance.findUnique({ where: { vendorId: vendor.id } }),
        prisma_1.default.vendorRating.findUnique({ where: { vendorId: vendor.id } }),
        // VendorAssignment has an `order` relation and Order has a `branch` relation
        prisma_1.default.vendorAssignment.findFirst({
            where: { vendorId: vendor.id },
            orderBy: { assignedAt: 'desc' },
            include: {
                order: {
                    include: { branch: true },
                },
            },
        }),
    ]);
    return {
        vendorId: vendor.id,
        vendorCode: vendor.vendorCode,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        status: vendor.status,
        isVerified: vendor.isVerified,
        assignedBranch: ((_a = assignment === null || assignment === void 0 ? void 0 : assignment.order) === null || _a === void 0 ? void 0 : _a.branch)
            ? { id: assignment.order.branch.id, name: assignment.order.branch.branchName }
            : null,
        totalOrders,
        activeOrders,
        completedOrders,
        todayOrders,
        walletBalance: (_b = wallet === null || wallet === void 0 ? void 0 : wallet.currentBalance) !== null && _b !== void 0 ? _b : 0,
        totalEarnings: (_c = wallet === null || wallet === void 0 ? void 0 : wallet.totalEarnings) !== null && _c !== void 0 ? _c : 0,
        pendingSettlement: (_d = wallet === null || wallet === void 0 ? void 0 : wallet.pendingBalance) !== null && _d !== void 0 ? _d : 0,
        completionRate: (_e = performance === null || performance === void 0 ? void 0 : performance.completionRate) !== null && _e !== void 0 ? _e : 0,
        acceptanceRate: (_f = performance === null || performance === void 0 ? void 0 : performance.acceptanceRate) !== null && _f !== void 0 ? _f : 0,
        averageProcessingTime: (_g = performance === null || performance === void 0 ? void 0 : performance.averageProcessingTime) !== null && _g !== void 0 ? _g : 0,
        averageRating: (_h = rating === null || rating === void 0 ? void 0 : rating.averageRating) !== null && _h !== void 0 ? _h : 0,
        totalReviews: (_j = rating === null || rating === void 0 ? void 0 : rating.totalReviews) !== null && _j !== void 0 ? _j : 0,
    };
};
exports.getOverview = getOverview;
