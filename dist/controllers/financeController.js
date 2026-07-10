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
exports.deleteDeliveryCharge = exports.updateDeliveryCharge = exports.createDeliveryCharge = exports.getAllDeliveryCharges = exports.deleteTax = exports.updateTax = exports.createTax = exports.getAllTaxes = void 0;
const taxService = __importStar(require("../services/finance/taxService"));
const deliveryChargeService = __importStar(require("../services/finance/deliveryChargeService"));
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
// Taxes
exports.getAllTaxes = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await taxService.getAllTaxes(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Taxes fetched successfully', data: result.data, meta: result.meta });
});
exports.createTax = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const tax = await taxService.createTax(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Tax created successfully', data: tax });
});
exports.updateTax = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const tax = await taxService.updateTax(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Tax updated successfully', data: tax });
});
exports.deleteTax = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await taxService.deleteTax(req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Tax deleted successfully' });
});
// Delivery Charges
exports.getAllDeliveryCharges = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await deliveryChargeService.getAllDeliveryCharges(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Delivery charges fetched successfully', data: result.data, meta: result.meta });
});
exports.createDeliveryCharge = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const charge = await deliveryChargeService.createDeliveryCharge(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Delivery charge created successfully', data: charge });
});
exports.updateDeliveryCharge = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const charge = await deliveryChargeService.updateDeliveryCharge(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Delivery charge updated successfully', data: charge });
});
exports.deleteDeliveryCharge = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await deliveryChargeService.deleteDeliveryCharge(req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Delivery charge deleted successfully' });
});
