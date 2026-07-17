"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public callback hooks from SSLCommerz (needs to bypass token verification because they are server-to-server or redirect POSTs)
router.post('/sslcommerz/success', paymentController_1.PaymentController.handleSuccess);
router.post('/sslcommerz/fail', paymentController_1.PaymentController.handleFail);
router.post('/sslcommerz/cancel', paymentController_1.PaymentController.handleCancel);
router.post('/sslcommerz/ipn', paymentController_1.PaymentController.handleIPN);
// Protected endpoints for initiating payments from client
router.post('/sslcommerz/initiate', authMiddleware_1.verifyToken, paymentController_1.PaymentController.initiateOrderPayment);
router.post('/sslcommerz/topup', authMiddleware_1.verifyToken, paymentController_1.PaymentController.initiateWalletTopup);
exports.default = router;
