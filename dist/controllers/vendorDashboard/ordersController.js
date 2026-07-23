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
exports.rejectOrder = exports.acceptOrder = exports.updateOrderStatus = exports.getOrders = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const ordersService = __importStar(require("../../services/vendorDashboard/ordersService"));
/** Safely resolve a route param that Express types as string | string[] */
function resolveParam(value) {
    if (!value)
        return null;
    return Array.isArray(value) ? value[0] : value;
}
exports.getOrders = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a, _b, _c, _d, _e;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const page = parseInt((_b = resolveParam(req.query.page)) !== null && _b !== void 0 ? _b : '1', 10) || 1;
    const limit = parseInt((_c = resolveParam(req.query.limit)) !== null && _c !== void 0 ? _c : '10', 10) || 10;
    const search = (_d = resolveParam(req.query.search)) !== null && _d !== void 0 ? _d : '';
    const status = (_e = resolveParam(req.query.status)) !== null && _e !== void 0 ? _e : 'ALL';
    const result = await ordersService.getOrders(userId, page, limit, search, status);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Orders fetched successfully',
        data: result.data,
        meta: result.meta,
    });
});
exports.updateOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const orderId = resolveParam(req.params.orderId);
    const { status } = req.body;
    if (!orderId) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
    }
    if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
    }
    const data = await ordersService.updateOrderStatus(userId, orderId, status);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Order status updated', data });
});
exports.acceptOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const orderId = resolveParam(req.params.orderId);
    if (!orderId) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
    }
    const data = await ordersService.acceptOrder(userId, orderId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Order accepted', data });
});
exports.rejectOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const orderId = resolveParam(req.params.orderId);
    const { reason } = req.body;
    if (!orderId) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
    }
    const data = await ordersService.rejectOrder(userId, orderId, reason !== null && reason !== void 0 ? reason : '');
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Order rejected', data });
});
