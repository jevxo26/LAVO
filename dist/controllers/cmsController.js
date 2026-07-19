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
exports.deleteContentItem = exports.updateContentItem = exports.createContentItem = exports.updateSection = exports.createOrUpdatePage = exports.getAllPages = exports.getPageBySlug = void 0;
const sendResponse_1 = require("../utils/sendResponse");
const catchAsync_1 = require("../utils/catchAsync");
const cmsService = __importStar(require("../services/cmsService"));
exports.getPageBySlug = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const slug = req.params.slug;
    const page = await cmsService.getPageBySlug(slug);
    if (!page) {
        return (0, sendResponse_1.sendResponse)(res, {
            statusCode: 404,
            success: false,
            message: "Page not found"
        });
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Page fetched successfully",
        data: page
    });
});
exports.getAllPages = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const pages = await cmsService.getAllPages();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Pages fetched successfully",
        data: pages
    });
});
exports.createOrUpdatePage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = await cmsService.createOrUpdatePage(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Page updated successfully",
        data: page
    });
});
exports.updateSection = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const section = await cmsService.updateSection(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Section updated successfully",
        data: section
    });
});
exports.createContentItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const item = await cmsService.createContentItem(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Content item created successfully",
        data: item
    });
});
exports.updateContentItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    const item = await cmsService.updateContentItem(id, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Content item updated successfully",
        data: item
    });
});
exports.deleteContentItem = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    await cmsService.deleteContentItem(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Content item deleted successfully"
    });
});
