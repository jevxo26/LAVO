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
exports.deleteReview = exports.updateReview = exports.createReview = exports.getAllReviews = exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getAllTickets = void 0;
const ticketService = __importStar(require("../services/support/ticketService"));
const reviewService = __importStar(require("../services/support/reviewService"));
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
// Tickets
exports.getAllTickets = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await ticketService.getAllTickets(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Tickets fetched successfully', data: result.data, meta: result.meta });
});
exports.createTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const ticket = await ticketService.createTicket(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Ticket created successfully', data: ticket });
});
exports.updateTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Ticket updated successfully', data: ticket });
});
exports.deleteTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await ticketService.deleteTicket(req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Ticket deleted successfully' });
});
// Reviews
exports.getAllReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const result = await reviewService.getAllReviews(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Reviews fetched successfully', data: result.data, meta: result.meta });
});
exports.createReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const review = await reviewService.createReview(req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Review created successfully', data: review });
});
exports.updateReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const review = await reviewService.updateReview(req.params.id, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Review updated successfully', data: review });
});
exports.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await reviewService.deleteReview(req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Review deleted successfully' });
});
