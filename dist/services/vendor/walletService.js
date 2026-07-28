"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getWallet = async (userId) => {
    var _a, _b, _c, _d, _e;
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const [wallet, recentTransactions, commissionAgg] = await Promise.all([
        prisma_1.default.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
        prisma_1.default.vendorTransaction.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        }),
        prisma_1.default.vendorCommission.aggregate({
            where: { vendorId: vendor.id },
            _sum: { commissionAmount: true },
        }),
    ]);
    return {
        walletBalance: (_a = wallet === null || wallet === void 0 ? void 0 : wallet.currentBalance) !== null && _a !== void 0 ? _a : 0,
        pendingBalance: (_b = wallet === null || wallet === void 0 ? void 0 : wallet.pendingBalance) !== null && _b !== void 0 ? _b : 0,
        totalEarnings: (_c = wallet === null || wallet === void 0 ? void 0 : wallet.totalEarnings) !== null && _c !== void 0 ? _c : 0,
        totalCommissionDeducted: (_d = commissionAgg._sum.commissionAmount) !== null && _d !== void 0 ? _d : 0,
        status: (_e = wallet === null || wallet === void 0 ? void 0 : wallet.status) !== null && _e !== void 0 ? _e : 'INACTIVE',
        recentTransactions: recentTransactions.map((t) => {
            var _a;
            return ({
                id: t.id,
                type: t.transactionType,
                amount: t.amount,
                status: t.status,
                referenceId: (_a = t.referenceId) !== null && _a !== void 0 ? _a : null,
                createdAt: t.createdAt,
            });
        }),
    };
};
exports.getWallet = getWallet;
