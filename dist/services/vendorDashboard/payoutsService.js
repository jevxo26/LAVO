"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.getPayouts = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getPayouts = async (userId, page, limit, status) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const skip = (page - 1) * limit;
    // Build a fully-typed where clause — no `any`
    const where = { vendorId: vendor.id };
    if (status && status !== 'ALL') {
        where.paymentStatus = status;
    }
    const [payouts, total] = await Promise.all([
        prisma_1.default.vendorPayout.findMany({
            where,
            skip,
            take: limit,
            orderBy: { requestedAt: 'desc' },
        }),
        prisma_1.default.vendorPayout.count({ where }),
    ]);
    return {
        data: payouts.map((p) => {
            var _a;
            return ({
                id: p.id,
                amount: p.amount,
                paymentMethod: p.paymentMethod,
                paymentStatus: p.paymentStatus,
                requestedAt: p.requestedAt,
                paidAt: (_a = p.paidAt) !== null && _a !== void 0 ? _a : null,
            });
        }),
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getPayouts = getPayouts;
const requestPayout = async (userId, data) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const wallet = await prisma_1.default.vendorWallet.findUnique({
        where: { vendorId: vendor.id },
    });
    if (!wallet)
        throw new Error('Wallet not found');
    if (wallet.currentBalance < data.amount)
        throw new Error('Insufficient balance for payout request');
    return prisma_1.default.vendorPayout.create({
        data: {
            vendorId: vendor.id,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            paymentStatus: 'PENDING',
        },
    });
};
exports.requestPayout = requestPayout;
