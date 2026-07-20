"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const ticketService_1 = require("../services/ticketService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const socket_1 = require("../socket");
class TicketController {
}
exports.TicketController = TicketController;
_a = TicketController;
// Create a new ticket
TicketController.createTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await ticketService_1.TicketService.createTicket(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Ticket created successfully',
        data: result,
    });
});
// Get tickets list based on role
TicketController.getTickets = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const role = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    if (!userId || !role) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await ticketService_1.TicketService.getTickets(userId, role);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        data: result,
    });
});
// Get active staff assignees
TicketController.getAssignableUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await ticketService_1.TicketService.getAssignableUsers();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        data: result,
    });
});
// Get ticket details and messages
TicketController.getTicketDetails = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const role = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    const id = req.params.id;
    if (!userId || !role) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await ticketService_1.TicketService.getTicketDetails(id, userId, role);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        data: result,
    });
});
// Update ticket status
TicketController.updateTicketStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const role = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    const id = req.params.id;
    const { status } = req.body;
    if (!userId || !role) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await ticketService_1.TicketService.updateTicketStatus(id, userId, role, status);
    try {
        (0, socket_1.getIO)().to(`ticket_${id}`).emit('ticketStatusUpdated', { ticketId: id, status });
    }
    catch (err) {
        console.error('Socket broadcast failed:', err);
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'Ticket status updated successfully',
        data: result,
    });
});
// Add message
TicketController.addMessage = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const role = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
    const id = req.params.id;
    const { content } = req.body;
    if (!userId || !role) {
        return (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
    }
    const result = await ticketService_1.TicketService.addMessage(id, userId, role, content);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: 'Message sent successfully',
        data: result,
    });
});
