"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSupportController = void 0;
const adminSupportService_1 = require("../../services/admin/adminSupportService");
const ticketService_1 = require("../../services/customer/ticketService");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
class AdminSupportController {
}
exports.AdminSupportController = AdminSupportController;
_a = AdminSupportController;
// ── Tickets ────────────────────────────────────────────────────────────────
AdminSupportController.getAllTickets = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";
    const result = await ticketService_1.TicketService.getAllTicketsForAdmin(page, limit, search);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Support tickets retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});
// ── Reviews ────────────────────────────────────────────────────────────────
AdminSupportController.getAllReviews = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const list = await adminSupportService_1.AdminSupportService.getAllReviews();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Reviews retrieved successfully",
        data: list,
    });
});
AdminSupportController.replyToReview = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const id = req.params.id;
    const { reply } = req.body;
    const result = await adminSupportService_1.AdminSupportService.replyToReview(id, reply, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Admin reply added successfully",
        data: result,
    });
});
// ── Announcements ──────────────────────────────────────────────────────────
AdminSupportController.getAllAnnouncements = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const list = await adminSupportService_1.AdminSupportService.getAllAnnouncements();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Announcements retrieved successfully",
        data: list,
    });
});
AdminSupportController.createAnnouncement = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await adminSupportService_1.AdminSupportService.createAnnouncement(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Announcement created successfully",
        data: result,
    });
});
