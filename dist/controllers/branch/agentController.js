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
exports.deleteDeliveryAgent = exports.updateDeliveryAgent = exports.createDeliveryAgent = exports.getDeliveryAgents = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
exports.getDeliveryAgents = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const branch = await branchDashboardService_1.default.branch.findUnique({ where: { id: branchId } });
    if (!branch)
        throw new Error('Branch not found');
    const agents = await branchDashboardService_1.default.deliveryAgent.findMany({ include: { user: true } });
    const formatted = agents.map((a) => {
        var _a, _b;
        return (Object.assign(Object.assign({}, a), { fullName: ((_a = a.user) === null || _a === void 0 ? void 0 : _a.fullName) || '-', email: ((_b = a.user) === null || _b === void 0 ? void 0 : _b.email) || '-' }));
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: formatted });
});
exports.createDeliveryAgent = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { fullName, email, employeeCode, phone, availability, status } = req.body;
    const user = await branchDashboardService_1.default.user.create({
        data: { fullName, email, password: 'dummyPassword123', userType: 'DELIVERY_AGENT' }
    });
    const agent = await branchDashboardService_1.default.deliveryAgent.create({
        data: { userId: user.id, employeeCode, phone, availability, status }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, data: agent });
});
exports.updateDeliveryAgent = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { id } = req.params;
    const { fullName, email, employeeCode, phone, availability, status } = req.body;
    const agent = await branchDashboardService_1.default.deliveryAgent.findUnique({ where: { id } });
    if (agent) {
        await branchDashboardService_1.default.user.update({ where: { id: agent.userId }, data: { fullName, email } });
        await branchDashboardService_1.default.deliveryAgent.update({ where: { id }, data: { employeeCode, phone, availability, status } });
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { success: true } });
});
exports.deleteDeliveryAgent = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    await branchDashboardService_1.default.deliveryAgent.delete({ where: { id: req.params.id } });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { success: true } });
});
