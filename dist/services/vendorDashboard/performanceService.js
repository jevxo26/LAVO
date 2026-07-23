"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformance = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getPerformance = async (userId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const [performance, rating, analytics, wallet] = await Promise.all([
        prisma_1.default.vendorPerformance.findUnique({ where: { vendorId: vendor.id } }),
        prisma_1.default.vendorRating.findUnique({ where: { vendorId: vendor.id } }),
        prisma_1.default.vendorAnalytics.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            take: 30,
        }),
        prisma_1.default.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
    ]);
    const totalRevenue = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);
    const totalCommission = analytics.reduce((sum, a) => sum + a.totalCommission, 0);
    const netEarnings = analytics.reduce((sum, a) => sum + a.netEarnings, 0);
    return {
        completionRate: (_a = performance === null || performance === void 0 ? void 0 : performance.completionRate) !== null && _a !== void 0 ? _a : 0,
        acceptanceRate: (_b = performance === null || performance === void 0 ? void 0 : performance.acceptanceRate) !== null && _b !== void 0 ? _b : 0,
        averageProcessingTime: (_c = performance === null || performance === void 0 ? void 0 : performance.averageProcessingTime) !== null && _c !== void 0 ? _c : 0,
        completedOrders: (_d = performance === null || performance === void 0 ? void 0 : performance.completedOrders) !== null && _d !== void 0 ? _d : 0,
        cancelledOrders: (_e = performance === null || performance === void 0 ? void 0 : performance.cancelledOrders) !== null && _e !== void 0 ? _e : 0,
        averageRating: (_f = rating === null || rating === void 0 ? void 0 : rating.averageRating) !== null && _f !== void 0 ? _f : 0,
        totalReviews: (_g = rating === null || rating === void 0 ? void 0 : rating.totalReviews) !== null && _g !== void 0 ? _g : 0,
        qualityScore: (_h = rating === null || rating === void 0 ? void 0 : rating.qualityScore) !== null && _h !== void 0 ? _h : 0,
        deliveryScore: (_j = rating === null || rating === void 0 ? void 0 : rating.deliveryScore) !== null && _j !== void 0 ? _j : 0,
        serviceScore: (_k = rating === null || rating === void 0 ? void 0 : rating.serviceScore) !== null && _k !== void 0 ? _k : 0,
        earningsSummary: {
            totalRevenue,
            totalCommission,
            netEarnings,
            walletBalance: (_l = wallet === null || wallet === void 0 ? void 0 : wallet.currentBalance) !== null && _l !== void 0 ? _l : 0,
            totalEarnings: (_m = wallet === null || wallet === void 0 ? void 0 : wallet.totalEarnings) !== null && _m !== void 0 ? _m : 0,
        },
        recentAnalytics: analytics.slice(0, 7).map((a) => ({
            date: a.createdAt,
            dailyOrders: a.dailyOrders,
            totalRevenue: a.totalRevenue,
            netEarnings: a.netEarnings,
        })),
    };
};
exports.getPerformance = getPerformance;
