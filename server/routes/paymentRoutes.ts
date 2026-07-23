import express from "express";
import { PaymentController } from "../controllers/paymentController";
import { PaymentCallbackController } from "../controllers/paymentCallbackController";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

// Public callback hooks from SSLCommerz & simulated gateway (supports POST and GET)
router.all("/sslcommerz/success", PaymentCallbackController.handleSuccess);
router.all("/sslcommerz/fail", PaymentCallbackController.handleFail);
router.all("/sslcommerz/cancel", PaymentCallbackController.handleCancel);

// Protected endpoints for client initiation & verification
router.post("/sslcommerz/initiate", requireAuth, PaymentController.initiateOrderPayment);
router.post("/verify-order-payment", requireAuth, PaymentController.verifyOrderPayment);

export default router;
