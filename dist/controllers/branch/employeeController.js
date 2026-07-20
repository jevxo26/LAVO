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
exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployees = void 0;
const catchServiceAsync_1 = require("../../utils/catchServiceAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const branchDashboardService_1 = __importStar(require("../../services/branchDashboardService"));
exports.getEmployees = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const employees = await branchDashboardService_1.default.branchEmployee.findMany({ where: { branchId } });
    const userIds = employees.map((e) => e.employeeId);
    const users = await branchDashboardService_1.default.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true, email: true }
    });
    const formatted = employees.map((e) => {
        const u = users.find((u) => u.id === e.employeeId);
        return Object.assign(Object.assign({}, e), { fullName: (u === null || u === void 0 ? void 0 : u.fullName) || '-', email: (u === null || u === void 0 ? void 0 : u.email) || '-' });
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: formatted });
});
exports.createEmployee = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    const branchId = await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { fullName, email, designation, status } = req.body;
    // TODO: Replace dummyPassword123 with a proper email invitation flow
    const user = await branchDashboardService_1.default.user.create({
        data: { fullName, email, password: 'dummyPassword123', userType: 'EMPLOYEE' }
    });
    const emp = await branchDashboardService_1.default.branchEmployee.create({
        data: { branchId, employeeId: user.id, designation, status }
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, data: emp });
});
exports.updateEmployee = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    const { id } = req.params;
    const { fullName, email, designation, status } = req.body;
    const emp = await branchDashboardService_1.default.branchEmployee.findUnique({ where: { id } });
    if (emp) {
        await branchDashboardService_1.default.user.update({ where: { id: emp.employeeId }, data: { fullName, email } });
        await branchDashboardService_1.default.branchEmployee.update({ where: { id }, data: { designation, status } });
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { success: true } });
});
exports.deleteEmployee = (0, catchServiceAsync_1.catchServiceAsync)(async (req, res) => {
    await (0, branchDashboardService_1.getBranchOrFail)(req);
    await branchDashboardService_1.default.branchEmployee.delete({ where: { id: req.params.id } });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, data: { success: true } });
});
