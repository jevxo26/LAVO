"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.getOverview = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branch-manager/branchDashboardService"));
// TODO: Replace MACHINERY_MOCK with actual live machinery data from the database
const MACHINERY_MOCK = [
    { type: 'Washer', count: 5, active: 4 },
    { type: 'Dryer', count: 5, active: 3 },
    { type: 'Iron', count: 10, active: 8 },
];
exports.getOverview = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const capacity = await branchDashboardService_1.default.branchCapacity.findUnique({ where: { branchId } });
    const pendingOrders = await branchDashboardService_1.default.order.count({
        where: { branchId, orderStatus: { in: ['PENDING', 'CONFIRMED'] } }
    });
    const activeOrders = await branchDashboardService_1.default.order.count({
        where: {
            branchId,
            orderStatus: { in: ['PICKUP', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'] }
        }
    });
    const completedOrders = await branchDashboardService_1.default.order.count({
        where: { branchId, orderStatus: { in: ['DELIVERED', 'COMPLETED'] } }
    });
    const vendorDelegatedOrders = await branchDashboardService_1.default.order.count({
        where: { branchId, vendorId: { not: null } }
    });
    const load = pendingOrders + activeOrders;
    const maxCap = (capacity === null || capacity === void 0 ? void 0 : capacity.maximumCapacity) || 50;
    const utilization = Math.min((load / maxCap) * 100, 100);
    // Dynamic Machinery Status based on garments currently being processed
    const washingGarments = await branchDashboardService_1.default.garmentItem.count({
        where: {
            orderItem: { order: { branchId } },
            status: 'WASHING'
        }
    });
    const dryingGarments = await branchDashboardService_1.default.garmentItem.count({
        where: {
            orderItem: { order: { branchId } },
            status: 'DRYING'
        }
    });
    const ironingGarments = await branchDashboardService_1.default.garmentItem.count({
        where: {
            orderItem: { order: { branchId } },
            status: 'IRONING'
        }
    });
    const activeMachinery = [
        { type: 'Washer', count: 10, active: Math.min(10, Math.ceil(washingGarments / 5) || (activeOrders > 0 ? 3 : 1)) },
        { type: 'Dryer', count: 8, active: Math.min(8, Math.ceil(dryingGarments / 5) || (activeOrders > 0 ? 2 : 1)) },
        { type: 'Iron', count: 12, active: Math.min(12, Math.ceil(ironingGarments / 3) || (activeOrders > 0 ? 4 : 2)) },
    ];
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: {
            capacityUtilization: utilization.toFixed(1),
            pendingOrders,
            activeOrders,
            completedOrders,
            vendorDelegatedOrders,
            activeMachinery
        }
    });
});
exports.getAnalytics = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    // Generate last 7 days date buckets
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = d.toISOString().split('T')[0];
        days.push({ name: dayName, dateStr, start: d, end: dayEnd });
    }
    // Fetch branch orders from the last 7 days
    const orders = await branchDashboardService_1.default.order.findMany({
        where: {
            branchId,
            createdAt: { gte: days[0].start }
        },
        select: {
            id: true,
            grandTotal: true,
            subtotal: true,
            deliveryCharge: true,
            vendorId: true,
            orderStatus: true,
            createdAt: true
        }
    });
    const dailyAnalytics = days.map((day) => {
        const dayOrders = orders.filter((o) => o.createdAt >= day.start && o.createdAt <= day.end);
        const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
        // Calculate operational expenses & vendor commissions
        const dayExpenses = dayOrders.reduce((sum, o) => {
            const costRatio = o.vendorId ? 0.35 : 0.15;
            return sum + (o.grandTotal || 0) * costRatio;
        }, 0);
        const dayProfit = dayRevenue - dayExpenses;
        return {
            name: day.name,
            date: day.dateStr,
            revenue: parseFloat(dayRevenue.toFixed(2)),
            expenses: parseFloat(dayExpenses.toFixed(2)),
            profit: parseFloat(dayProfit.toFixed(2)),
            ordersCount: dayOrders.length
        };
    });
    const totalRevenue = dailyAnalytics.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = dailyAnalytics.reduce((sum, d) => sum + d.expenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    // Order status breakdown for distribution charts
    const statusCounts = await branchDashboardService_1.default.order.groupBy({
        by: ['orderStatus'],
        where: { branchId },
        _count: { id: true }
    });
    const statusDistribution = statusCounts.map((sc) => ({
        status: sc.orderStatus,
        count: sc._count.id
    }));
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: {
            revenue: dailyAnalytics.map((d) => ({ name: d.name, total: d.revenue })),
            expenses: dailyAnalytics.map((d) => ({ name: d.name, total: d.expenses })),
            profit: dailyAnalytics.map((d) => ({ name: d.name, total: d.profit })),
            dailyBreakdown: dailyAnalytics,
            totals: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalExpenses: parseFloat(totalExpenses.toFixed(2)),
                netProfit: parseFloat(netProfit.toFixed(2))
            },
            statusDistribution
        }
    });
});
