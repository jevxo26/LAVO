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
exports.getOrderQrCodes = exports.generateQrCode = exports.assignAgentToOrder = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
exports.assignAgentToOrder = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { orderId, agentId } = req.body;
    if (!orderId || !agentId)
        throw new Error('orderId and agentId are required');
    const order = await branchDashboardService_1.default.order.update({
        where: { id: orderId },
        data: { deliveryAgentId: agentId }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: order });
});
exports.generateQrCode = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { garmentItemId } = req.params;
    const existing = await branchDashboardService_1.default.garmentQRCode.findUnique({ where: { garmentItemId } });
    if (existing) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: existing });
        return;
    }
    const qrCode = `LAVO-${garmentItemId.slice(0, 8).toUpperCase()}-${Date.now()}`;
    const record = await branchDashboardService_1.default.garmentQRCode.create({
        data: { garmentItemId, qrCode, status: 'ACTIVE' }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, data: record });
});
exports.getOrderQrCodes = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { orderId } = req.params;
    const items = await branchDashboardService_1.default.garmentItem.findMany({
        where: { orderItem: { orderId } },
        include: { qrCodeRecord: true }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: items });
});
