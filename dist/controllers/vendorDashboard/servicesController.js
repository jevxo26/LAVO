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
exports.toggleServiceStatus = exports.updateService = exports.getServices = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const servicesService = __importStar(require("../../services/vendorDashboard/servicesService"));
/** Express route params are typed as string | string[] — resolve to plain string. */
function resolveParam(value) {
    if (!value)
        return null;
    return Array.isArray(value) ? value[0] : value;
}
exports.getServices = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const data = await servicesService.getServices(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Services fetched successfully', data });
});
exports.updateService = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const serviceId = resolveParam(req.params.serviceId);
    if (!serviceId) {
        res.status(400).json({ success: false, message: 'Service ID is required' });
        return;
    }
    const data = await servicesService.updateService(userId, serviceId, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Service updated', data });
});
exports.toggleServiceStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const serviceId = resolveParam(req.params.serviceId);
    if (!serviceId) {
        res.status(400).json({ success: false, message: 'Service ID is required' });
        return;
    }
    const data = await servicesService.toggleServiceStatus(userId, serviceId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Service status toggled', data });
});
