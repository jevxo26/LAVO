"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const customerService_1 = require("../services/customerService");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
CustomerController.getDeliveryOTP = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const { id } = req.params;
    // 1. Check if order belongs to customer
    const order = await prisma.order.findUnique({
        where: { id },
        include: { customer: true }
    });
    if (!order || order.customer.userId !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId)) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, success: false, message: 'Order not found', data: null });
        return;
    }
    // 2. Find PICKUP delivery (agent coming to collect) - show OTP when order is CONFIRMED
    const pickupDelivery = await prisma.delivery.findFirst({
        where: { orderId: id, deliveryType: 'PICKUP' },
        orderBy: { createdAt: 'desc' }
    });
    let pickupOtpCode = null;
    if (pickupDelivery) {
        const pickupOtp = await prisma.deliveryOTP.findFirst({
            where: { deliveryId: pickupDelivery.id, isUsed: false },
            orderBy: { createdAt: 'desc' }
        });
        pickupOtpCode = (pickupOtp === null || pickupOtp === void 0 ? void 0 : pickupOtp.otpCode) || null;
    }
    // 3. Find DROP_OFF delivery (agent returning clean clothes) - show OTP when READY_FOR_DELIVERY
    const dropoffDelivery = await prisma.delivery.findFirst({
        where: { orderId: id, deliveryType: 'DROP_OFF' },
        orderBy: { createdAt: 'desc' }
    });
    let dropoffOtpCode = null;
    if (dropoffDelivery) {
        const dropoffOtp = await prisma.deliveryOTP.findFirst({
            where: { deliveryId: dropoffDelivery.id, isUsed: false },
            orderBy: { createdAt: 'desc' }
        });
        dropoffOtpCode = (dropoffOtp === null || dropoffOtp === void 0 ? void 0 : dropoffOtp.otpCode) || null;
    }
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: 'OTP fetched',
        data: {
            // Legacy field kept for compatibility
            otpCode: dropoffOtpCode,
            // New separate fields
            pickupOtpCode,
            dropoffOtpCode,
        }
    });
});
CustomerController.cancelOrder = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
    const { id } = req.params;
    if (!userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 401, message: 'Unauthorized' });
        return;
    }
    // 1. Fetch the order and verify it belongs to this customer
    const order = await prisma.order.findUnique({
        where: { id },
        include: { customer: true }
    });
    if (!order || order.customer.userId !== userId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, success: false, message: 'Order not found' });
        return;
    }
    // 2. Only allow cancellation if not yet physically collected by agent
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 400,
            success: false,
            message: `Order cannot be cancelled. It is already in "${order.orderStatus}" status. Please contact support.`
        });
        return;
    }
    // 3. Cancel everything in a transaction
    await prisma.$transaction(async (tx) => {
        // Delete all delivery records for this order (removes from agent history completely)
        const deliveries = await tx.delivery.findMany({ where: { orderId: id } });
        for (const delivery of deliveries) {
            // Invalidate all OTPs
            await tx.deliveryOTP.updateMany({
                where: { deliveryId: delivery.id },
                data: { isUsed: true }
            });
            // Remove delivery verifications, timelines, logs etc. via cascade
            await tx.delivery.delete({ where: { id: delivery.id } });
        }
        // Cancel the order itself
        await tx.order.update({
            where: { id },
            data: { orderStatus: 'CANCELLED' }
        });
        // Add a timeline entry
        await tx.orderTimeline.create({
            data: {
                orderId: id,
                status: 'CANCELLED',
                description: 'Order was cancelled by the customer.'
            }
        });
    });
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, message: 'Order cancelled successfully' });
});
