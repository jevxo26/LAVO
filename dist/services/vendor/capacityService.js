"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCapacity = exports.getCapacity = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const overviewService_1 = require("./overviewService");
// ── Service ───────────────────────────────────────────────────────────────────
const getCapacity = async (userId) => {
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const capacity = await prisma_1.default.vendorCapacity.findUnique({
        where: { vendorId: vendor.id },
    });
    if (!capacity) {
        return {
            vendorId: vendor.id,
            dailyCapacity: 0,
            usedCapacity: 0,
            remainingCapacity: 0,
            maximumCapacity: 0,
            utilizationPercent: 0,
            status: 'NOT_SET',
        };
    }
    const used = capacity.currentOrders;
    const remaining = Math.max(capacity.dailyCapacity - used, 0);
    const utilizationPercent = capacity.dailyCapacity > 0
        ? Math.min((used / capacity.dailyCapacity) * 100, 100)
        : 0;
    let status = 'AVAILABLE';
    if (utilizationPercent >= 100)
        status = 'FULL';
    else if (utilizationPercent >= 80)
        status = 'NEAR_FULL';
    return {
        vendorId: vendor.id,
        dailyCapacity: capacity.dailyCapacity,
        usedCapacity: used,
        remainingCapacity: remaining,
        maximumCapacity: capacity.maximumCapacity,
        utilizationPercent: parseFloat(utilizationPercent.toFixed(1)),
        status,
    };
};
exports.getCapacity = getCapacity;
const updateCapacity = async (userId, data) => {
    var _a, _b;
    const vendor = await (0, overviewService_1.getVendorByUserId)(userId);
    const daily = (_a = data.dailyCapacity) !== null && _a !== void 0 ? _a : 50;
    const maximum = (_b = data.maximumCapacity) !== null && _b !== void 0 ? _b : 100;
    // VendorCapacity has no `createdAt` field — upsert without it
    return prisma_1.default.vendorCapacity.upsert({
        where: { vendorId: vendor.id },
        update: Object.assign(Object.assign(Object.assign({}, (data.dailyCapacity !== undefined && { dailyCapacity: data.dailyCapacity })), (data.maximumCapacity !== undefined && { maximumCapacity: data.maximumCapacity })), (data.dailyCapacity !== undefined && {
            availableCapacity: Math.max(data.dailyCapacity, 0),
        })),
        create: {
            vendorId: vendor.id,
            dailyCapacity: daily,
            maximumCapacity: maximum,
            currentOrders: 0,
            availableCapacity: daily,
        },
    });
};
exports.updateCapacity = updateCapacity;
