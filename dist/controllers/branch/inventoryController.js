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
exports.deleteInventory = exports.updateInventory = exports.createInventory = exports.getInventory = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
exports.getInventory = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const inventory = await branchDashboardService_1.default.branchInventory.findMany({ where: { branchId } });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: inventory });
});
exports.createInventory = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const item = await branchDashboardService_1.default.branchInventory.create({ data: Object.assign({ branchId }, req.body) });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, data: item });
});
exports.updateInventory = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const item = await branchDashboardService_1.default.branchInventory.update({ where: { id: req.params.id }, data: req.body });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: item });
});
exports.deleteInventory = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    await branchDashboardService_1.default.branchInventory.delete({ where: { id: req.params.id } });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { success: true } });
});
