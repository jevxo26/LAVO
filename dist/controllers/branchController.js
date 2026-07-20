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
exports.deleteBranch = exports.updateBranch = exports.createBranch = exports.getBranchById = exports.getAllBranches = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const branchService = __importStar(require("../services/branchService"));
exports.getAllBranches = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await branchService.getAllBranches(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Branches retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});
exports.getBranchById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const branch = await branchService.getBranchById(id);
    if (!branch) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            success: false,
            message: 'Branch not found',
            data: null
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Branch retrieved successfully',
        data: branch
    });
});
const zod_1 = require("zod");
const createBranchSchema = zod_1.z.object({
    branchCode: zod_1.z.string().optional(),
    branchName: zod_1.z.string().min(1, "Branch name cannot be empty"),
    branchType: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal('')),
    manager: zod_1.z.string().optional(),
    managerId: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    // Accept 'Active', 'Inactive', 'ACTIVE', 'INACTIVE' — normalised to uppercase in the service
    status: zod_1.z.string().optional().transform((val) => val === null || val === void 0 ? void 0 : val.toUpperCase()),
}).refine((data) => !data.status || ['ACTIVE', 'INACTIVE'].includes(data.status), { message: "Status must be 'Active' or 'Inactive'", path: ['status'] });
exports.createBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const validatedData = createBranchSchema.parse(req.body);
    const branch = await branchService.createBranch(validatedData);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Branch created successfully',
        data: branch
    });
});
exports.updateBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const branch = await branchService.updateBranch(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Branch updated successfully',
        data: branch
    });
});
exports.deleteBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    await branchService.deleteBranch(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Branch deleted successfully',
        data: null
    });
});
