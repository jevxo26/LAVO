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
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
const MACHINERY_MOCK = [
    { type: 'Washer', count: 5, active: 4 },
    { type: 'Dryer', count: 5, active: 3 },
    { type: 'Iron', count: 10, active: 8 },
];
exports.getOverview = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const capacity = await branchDashboardService_1.default.branchCapacity.findUnique({ where: { branchId } });
    const { pending, active } = await (0, branchDashboardService_1.getOrderCounts)(branchId);
    const load = pending + active;
    const utilization = Math.min((load / ((capacity === null || capacity === void 0 ? void 0 : capacity.maximumCapacity) || 1000)) * 100, 100);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        data: { capacityUtilization: utilization.toFixed(1), pendingOrders: pending, activeOrders: active, activeMachinery: MACHINERY_MOCK }
    });
});
exports.getAnalytics = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const analytics = {
        revenue: [4000, 3000, 2000, 2780, 1890, 2390, 3490].map((t, i) => ({ name: days[i], total: t })),
        expenses: [2400, 1398, 9800, 3908, 4800, 3800, 4300].map((t, i) => ({ name: days[i], total: t }))
    };
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: analytics });
});
