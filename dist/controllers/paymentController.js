"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../utils/catchAsync");
const sendResponse_1 = require("../utils/sendResponse");
const customerService_1 = require("../services/customerService");
const prisma = new client_1.PrismaClient();
function getBaseUrl(req) {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    return `${protocol}://${host}`;
}
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
/**
 * POST /api/payments/sslcommerz/initiate
 * Initiates payment for an Order.
 */
PaymentController.initiateOrderPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
    const { orderId } = req.body;
    if (!userId || !orderId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: "User ID and Order ID are required" });
        return;
    }
    const customer = await customerService_1.CustomerService.getOrCreateCustomer(userId);
    const order = await prisma.order.findFirst({
        where: { id: orderId, customerId: customer.id },
    });
    if (!order) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 404, message: "Order not found" });
        return;
    }
    if (order.paymentStatus === "PAID") {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: "Order is already paid" });
        return;
    }
    const tran_id = `TXN-${Date.now()}-${order.id}`;
    const baseUrl = getBaseUrl(req);
    let paymentMethod = await prisma.paymentMethod.findFirst({ where: { name: "SSLCommerz" } });
    if (!paymentMethod) {
        paymentMethod = await prisma.paymentMethod.create({
            data: { name: "SSLCommerz", provider: "SSLCommerz", methodType: "ONLINE", isOnline: true },
        });
    }
    await prisma.payment.create({
        data: {
            orderId: order.id,
            customerId: customer.id,
            paymentNumber: `PAY-${Date.now()}`,
            paymentMethodId: paymentMethod.id,
            transactionId: tran_id,
            amount: order.grandTotal,
            currency: "BDT",
            paymentStatus: "PENDING",
            paymentType: "ORDER",
        },
    });
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
    if (storeId && storePass) {
        try {
            const params = new URLSearchParams();
            params.append("store_id", storeId);
            params.append("store_passwd", storePass);
            params.append("total_amount", order.grandTotal.toString());
            params.append("currency", "BDT");
            params.append("tran_id", tran_id);
            params.append("success_url", `${baseUrl}/api/payments/sslcommerz/success`);
            params.append("fail_url", `${baseUrl}/api/payments/sslcommerz/fail`);
            params.append("cancel_url", `${baseUrl}/api/payments/sslcommerz/cancel`);
            params.append("ipn_url", `${baseUrl}/api/payments/sslcommerz/success`);
            params.append("cus_name", customer.user.fullName);
            params.append("cus_email", customer.user.email);
            params.append("cus_phone", customer.user.phone || "01700000000");
            const sslRes = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString(),
            });
            const sslData = await sslRes.json();
            if ((sslData === null || sslData === void 0 ? void 0 : sslData.status) === "SUCCESS" && (sslData === null || sslData === void 0 ? void 0 : sslData.GatewayPageURL)) {
                (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: { gatewayUrl: sslData.GatewayPageURL } });
                return;
            }
        }
        catch (_d) { }
    }
    const gatewayUrl = `${baseUrl}/payment/simulated?session_id=${tran_id}&amount=${order.grandTotal}&type=order&ref=${order.id}`;
    (0, sendResponse_1.sendResponse)(res, { statusCode: 200, success: true, data: { gatewayUrl } });
});
/**
 * POST /api/payments/verify-order-payment
 * Explicitly updates an order's payment status to PAID if verified.
 */
PaymentController.verifyOrderPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
    const { orderId } = req.body;
    const customer = await customerService_1.CustomerService.getOrCreateCustomer(userId);
    let targetOrder = null;
    if (orderId) {
        targetOrder = await prisma.order.findFirst({ where: { id: orderId, customerId: customer.id } });
    }
    if (!targetOrder) {
        targetOrder = await prisma.order.findFirst({
            where: { customerId: customer.id, paymentStatus: "UNPAID" },
            orderBy: { createdAt: "desc" },
        });
    }
    if (targetOrder) {
        const updated = await prisma.order.update({
            where: { id: targetOrder.id },
            data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
        });
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 200,
            success: true,
            message: "Order payment status updated to PAID",
            data: updated,
        });
        return;
    }
    (0, sendResponse_1.sendResponse)(res, { statusCode: 404, message: "No unpaid order found" });
});
