"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const paymentCallbackController_1 = require("../controllers/paymentCallbackController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Public callback hooks from SSLCommerz & simulated gateway (supports POST and GET)
router.all("/sslcommerz/success", paymentCallbackController_1.PaymentCallbackController.handleSuccess);
router.all("/sslcommerz/fail", paymentCallbackController_1.PaymentCallbackController.handleFail);
router.all("/sslcommerz/cancel", paymentCallbackController_1.PaymentCallbackController.handleCancel);
// Protected endpoints for client initiation & verification
router.post("/sslcommerz/initiate", auth_middleware_1.requireAuth, paymentController_1.PaymentController.initiateOrderPayment);
router.post("/verify-order-payment", auth_middleware_1.requireAuth, paymentController_1.PaymentController.verifyOrderPayment);
exports.default = router;
