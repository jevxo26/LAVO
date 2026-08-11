"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const client_1 = require("@prisma/client");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const customerService_1 = require("../../services/customer/customerService");
const prisma = new client_1.PrismaClient();
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID || '';
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === 'true';
const SSL_INIT_URL = IS_LIVE
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';
const SSL_VALIDATE_URL = IS_LIVE
    ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php';
function getBaseUrl(req) {
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
    return `${protocol}://${host}`;
}
// ─── SSLCommerz Verification ──────────────────────────────────────────────────
async function verifySSLCommerz(val_id) {
    if (!STORE_ID || !STORE_PASSWORD) {
        console.error("❌ [SSLCommerz] Missing STORE_ID or STORE_PASSWORD in .env");
        return false;
    }
    if (!val_id)
        return false;
    try {
        const url = `${SSL_VALIDATE_URL}?val_id=${val_id}&store_id=${STORE_ID}&store_passwd=${STORE_PASSWORD}&v=1&format=json`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("💳 [SSLCommerz] Validation response:", JSON.stringify(data, null, 2));
        // In sandbox mode SSLCommerz returns "VALID" or "VALIDATED"
        return (data === null || data === void 0 ? void 0 : data.status) === "VALID" || (data === null || data === void 0 ? void 0 : data.status) === "VALIDATED";
    }
    catch (err) {
        console.error("❌ [SSLCommerz] Verification request failed:", err);
        return false;
    }
}
// ─── Build SSLCommerz payload ─────────────────────────────────────────────────
function buildSSLPayload(baseUrl, tran_id, amount, customer, label) {
    var _b, _c, _d;
    const params = new URLSearchParams();
    params.append("store_id", STORE_ID);
    params.append("store_passwd", STORE_PASSWORD);
    params.append("total_amount", amount.toString());
    params.append("currency", "BDT");
    params.append("tran_id", tran_id);
    params.append("success_url", `${baseUrl}/api/payments/sslcommerz/success`);
    params.append("fail_url", `${baseUrl}/api/payments/sslcommerz/fail`);
    params.append("cancel_url", `${baseUrl}/api/payments/sslcommerz/cancel`);
    params.append("ipn_url", `${baseUrl}/api/payments/sslcommerz/ipn`);
    params.append("cus_name", ((_b = customer === null || customer === void 0 ? void 0 : customer.user) === null || _b === void 0 ? void 0 : _b.fullName) || "Customer");
    params.append("cus_email", ((_c = customer === null || customer === void 0 ? void 0 : customer.user) === null || _c === void 0 ? void 0 : _c.email) || "customer@lavo.app");
    params.append("cus_phone", ((_d = customer === null || customer === void 0 ? void 0 : customer.user) === null || _d === void 0 ? void 0 : _d.phone) || "01700000000");
    params.append("cus_add1", "Dhaka, Bangladesh");
    params.append("cus_city", "Dhaka");
    params.append("cus_country", "Bangladesh");
    params.append("shipping_method", "NO");
    params.append("product_name", label);
    params.append("product_category", "Laundry");
    params.append("product_profile", "general");
    return params;
}
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
// ─── POST /api/payments/sslcommerz/initiate ────────────────────────────────
PaymentController.initiateOrderPayment = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c;
    const userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
    const { orderId } = req.body;
    if (!userId || !orderId) {
        (0, sendResponse_1.sendResponse)(res, { statusCode: 400, message: "User ID and Order ID are required" });
        return;
    }
    if (!STORE_ID || !STORE_PASSWORD) {
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 503,
            message: "Payment gateway not configured. Please check SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in .env",
        });
        return;
    }
    const customer = await customerService_1.CustomerService.getOrCreateCustomer(userId);
    const order = await prisma.order.findFirst({
        where: { id: orderId, customerId: customer.id },
        include: { customer: { include: { user: true } } },
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
    // Ensure SSLCommerz payment method exists
    let paymentMethod = await prisma.paymentMethod.findFirst({ where: { name: "SSLCommerz" } });
    if (!paymentMethod) {
        paymentMethod = await prisma.paymentMethod.create({
            data: { name: "SSLCommerz", provider: "SSLCommerz", methodType: "ONLINE", isOnline: true },
        });
    }
    // Create a PENDING payment record
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
    // POST to SSLCommerz
    try {
        const params = buildSSLPayload(baseUrl, tran_id, order.grandTotal, customer, `LAVO Order #${order.orderNumber}`);
        const sslRes = await fetch(SSL_INIT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
        const sslData = await sslRes.json();
        console.log("💳 [SSLCommerz] Init response:", JSON.stringify(sslData, null, 2));
        if ((sslData === null || sslData === void 0 ? void 0 : sslData.status) === "SUCCESS" && (sslData === null || sslData === void 0 ? void 0 : sslData.GatewayPageURL)) {
            (0, sendResponse_1.sendResponse)(res, {
                statusCode: 200,
                success: true,
                data: { gatewayUrl: sslData.GatewayPageURL, tran_id },
            });
            return;
        }
        // SSLCommerz itself returned an error
        console.error("❌ [SSLCommerz] Gateway error:", sslData);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 502,
            message: (sslData === null || sslData === void 0 ? void 0 : sslData.failedreason) || "SSLCommerz gateway error. Please try again.",
        });
    }
    catch (err) {
        console.error("❌ [SSLCommerz] Network error:", err);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: 503,
            message: "Could not reach payment gateway. Please try again later.",
        });
    }
});
// ─── POST /api/payments/verify-order-payment ───────────────────────────────
// Manual server-side verification for logged-in customers (fallback)
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
// ─── SSLCommerz Success Callback ──────────────────────────────────────────
PaymentController.handleSuccess = (0, catchAsync_1.catchAsync)(async (req, res) => {
    var _b, _c, _d, _e;
    const tran_id = (((_b = req.body) === null || _b === void 0 ? void 0 : _b.tran_id) || ((_c = req.query) === null || _c === void 0 ? void 0 : _c.tran_id) || '').toString();
    const val_id = (((_d = req.body) === null || _d === void 0 ? void 0 : _d.val_id) || ((_e = req.query) === null || _e === void 0 ? void 0 : _e.val_id) || '').toString();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log("💳 [SSLCommerz] Success callback:", { tran_id, val_id });
    const validated = await verifySSLCommerz(val_id);
    if (!validated) {
        console.warn("⚠️ [SSLCommerz] Validation failed for val_id:", val_id);
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail&msg=Payment%20verification%20failed`);
        return;
    }
    // ── Order payment ─────────────────────────────────────────────────────────
    if (tran_id && tran_id.startsWith('TXN-')) {
        let paymentRecord = await prisma.payment.findFirst({ where: { transactionId: tran_id } });
        if (!paymentRecord) {
            const orderIdPart = tran_id.split('-').pop();
            if (orderIdPart) {
                paymentRecord = await prisma.payment.findFirst({
                    where: {
                        OR: [
                            { orderId: orderIdPart },
                            { transactionId: { contains: tran_id } },
                        ],
                    },
                });
            }
        }
        if (paymentRecord) {
            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: paymentRecord.id },
                    data: { paymentStatus: "PAID", paidAt: new Date() },
                });
                await tx.order.update({
                    where: { id: paymentRecord.orderId },
                    data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
                });
                await tx.orderTimeline.create({
                    data: {
                        orderId: paymentRecord.orderId,
                        status: "CONFIRMED",
                        description: `Paid ৳${paymentRecord.amount} via SSLCommerz.`,
                    },
                });
                const pointsEarned = Math.floor(paymentRecord.amount / 100);
                if (pointsEarned > 0) {
                    await tx.customer.update({
                        where: { id: paymentRecord.customerId },
                        data: { loyaltyPoints: { increment: pointsEarned } },
                    });
                    await tx.customerLoyaltyPoint.upsert({
                        where: { customerId: paymentRecord.customerId },
                        update: { earnedPoints: { increment: pointsEarned }, availablePoints: { increment: pointsEarned } },
                        create: { customerId: paymentRecord.customerId, earnedPoints: pointsEarned, availablePoints: pointsEarned },
                    });
                }
            });
        }
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=success`);
        return;
    }
    // ── Wallet top-up ─────────────────────────────────────────────────────────
    if (tran_id && tran_id.startsWith('TOPUP-')) {
        const transaction = await prisma.customerTransaction.findFirst({
            where: { referenceId: tran_id },
            include: { wallet: true },
        });
        if (transaction && transaction.status === 'PENDING') {
            const topupAmount = transaction.amount;
            const wallet = transaction.wallet;
            await prisma.$transaction(async (tx) => {
                await tx.customerTransaction.update({
                    where: { id: transaction.id },
                    data: { status: 'COMPLETED' },
                });
                await tx.customerWallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: topupAmount }, lastTransactionAt: new Date() },
                });
                await tx.customer.update({
                    where: { id: wallet.customerId },
                    data: { walletBalance: { increment: topupAmount } },
                });
            });
        }
        res.redirect(`${frontendUrl}/dashboard/wallet?status=success`);
        return;
    }
    res.redirect(`${frontendUrl}/dashboard?status=success`);
});
// ─── SSLCommerz Fail Callback ─────────────────────────────────────────────
PaymentController.handleFail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tran_id } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log("❌ [SSLCommerz] Payment failed:", tran_id);
    if (tran_id === null || tran_id === void 0 ? void 0 : tran_id.startsWith('TXN-')) {
        const rec = await prisma.payment.findFirst({ where: { transactionId: tran_id } });
        if (rec)
            await prisma.payment.update({ where: { id: rec.id }, data: { paymentStatus: 'FAILED' } });
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=fail`);
    }
    else if (tran_id === null || tran_id === void 0 ? void 0 : tran_id.startsWith('TOPUP-')) {
        await prisma.customerTransaction.updateMany({ where: { referenceId: tran_id }, data: { status: 'FAILED' } });
        res.redirect(`${frontendUrl}/dashboard/wallet?status=fail`);
    }
    else {
        res.redirect(`${frontendUrl}/dashboard?status=fail`);
    }
});
// ─── SSLCommerz Cancel Callback ───────────────────────────────────────────
PaymentController.handleCancel = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { tran_id } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log("⚠️ [SSLCommerz] Payment cancelled:", tran_id);
    if (tran_id === null || tran_id === void 0 ? void 0 : tran_id.startsWith('TXN-')) {
        const rec = await prisma.payment.findFirst({ where: { transactionId: tran_id } });
        if (rec)
            await prisma.payment.update({ where: { id: rec.id }, data: { paymentStatus: 'CANCELLED' } });
        res.redirect(`${frontendUrl}/dashboard/my-orders?status=cancel`);
    }
    else if (tran_id === null || tran_id === void 0 ? void 0 : tran_id.startsWith('TOPUP-')) {
        await prisma.customerTransaction.updateMany({ where: { referenceId: tran_id }, data: { status: 'CANCELLED' } });
        res.redirect(`${frontendUrl}/dashboard/wallet?status=cancel`);
    }
    else {
        res.redirect(`${frontendUrl}/dashboard?status=cancel`);
    }
});
// ─── SSLCommerz IPN Webhook ───────────────────────────────────────────────
PaymentController.handleIPN = (0, catchAsync_1.catchAsync)(async (req, res) => {
    console.log("📨 [SSLCommerz] IPN received:", req.body);
    res.status(200).send("IPN Received");
});
