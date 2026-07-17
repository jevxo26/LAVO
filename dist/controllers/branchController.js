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
exports.createBranch = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // In a real app, you would validate req.body with Zod or express-validator here
    const branch = await branchService.createBranch(req.body);
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
