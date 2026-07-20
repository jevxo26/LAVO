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
exports.getDevOTP = exports.markOrderReadyForDelivery = exports.getOrders = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
exports.getOrders = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const orders = await branchDashboardService_1.default.order.findMany({
        where: { branchId },
        include: { customer: { include: { user: true } }, items: { include: { service: true } } },
        orderBy: { createdAt: 'desc' }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: orders });
});
const deliveryAssignmentService_1 = require("../../services/deleveryAgent/deliveryAssignmentService");
exports.markOrderReadyForDelivery = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { orderId } = req.params;
    const order = await branchDashboardService_1.default.order.findFirst({ where: { id: orderId, branchId } });
    if (!order)
        throw new Error('Order not found or does not belong to your branch');
    await branchDashboardService_1.default.order.update({
        where: { id: orderId },
        data: { orderStatus: 'READY_FOR_DELIVERY' }
    });
    // Automatically trigger the drop-off delivery engine
    const delivery = await deliveryAssignmentService_1.DeliveryAssignmentService.autoAssignDropoffDelivery(orderId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { orderId, delivery } });
});
exports.getDevOTP = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const { orderId } = req.params;
    const delivery = await branchDashboardService_1.default.delivery.findFirst({
        where: { orderId, deliveryType: 'DROP_OFF' },
        orderBy: { createdAt: 'desc' }
    });
    if (!delivery) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { otpCode: null, message: "No drop-off delivery found" } });
        return;
    }
    const otp = await branchDashboardService_1.default.deliveryOTP.findFirst({
        where: { deliveryId: delivery.id },
        orderBy: { createdAt: 'desc' }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { otpCode: (otp === null || otp === void 0 ? void 0 : otp.otpCode) || null, message: otp ? "OTP found" : "No OTP found" } });
});
