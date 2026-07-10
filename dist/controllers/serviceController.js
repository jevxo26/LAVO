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
exports.deleteService = exports.updateService = exports.createService = exports.getAllServices = void 0;
const laundryService = __importStar(require("../services/laundryService"));
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
exports.getAllServices = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await laundryService.getAllServices(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Services fetched successfully', data: result.data, meta: result.meta });
});
exports.createService = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const service = await laundryService.createService(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Service created successfully', data: service });
});
exports.updateService = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const service = await laundryService.updateService(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Service updated successfully', data: service });
});
exports.deleteService = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await laundryService.deleteService(req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Service deleted successfully' });
});
