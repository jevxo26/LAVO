"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customerService_1 = require("../services/customerService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
class CustomerController {
}
exports.CustomerController = CustomerController;
_a = CustomerController;
CustomerController.getProfileSummary = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getProfileSummary(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Profile summary fetched', data: result });
});
CustomerController.getServices = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const result = await customerService_1.CustomerService.getServices(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Services fetched', data: result });
});
CustomerController.placeOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.placeOrder(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Order placed successfully', data: result });
});
CustomerController.getOrders = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getOrders(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Orders fetched successfully', data: result });
});
CustomerController.getOrderDetails = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getOrderDetails(userId, req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Order details fetched', data: result });
});
CustomerController.addToWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const { serviceId } = req.body;
    if (!userId || !serviceId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Missing parameters' });
        return;
    }
    const result = await customerService_1.CustomerService.addToWishlist(userId, serviceId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.removeFromWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const { serviceId } = req.params;
    if (!userId || !serviceId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Missing parameters' });
        return;
    }
    const result = await customerService_1.CustomerService.removeFromWishlist(userId, serviceId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.getWishlist = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getWishlist(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.createTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.createTicket(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Ticket created successfully', data: result });
});
CustomerController.getTickets = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getTickets(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.getTicketDetails = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getTicketDetails(userId, req.params.id);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.replyToTicket = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const { message } = req.body;
    if (!userId || !message) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: 'Message is required' });
        return;
    }
    const result = await customerService_1.CustomerService.replyToTicket(userId, req.params.id, message);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 201, success: true, message: 'Reply posted', data: result });
});
CustomerController.getFAQs = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await customerService_1.CustomerService.getFAQs();
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
CustomerController.getTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    const result = await customerService_1.CustomerService.getTransactions(userId);
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: result });
});
