import express from "express";
import { PaymentController } from "../../controllers/customer/paymentController";
import { PaymentCallbackController } from "../../controllers/customer/paymentCallbackController";
import { requireAuth } from "../../middlewares/authMiddleware";

const router = express.Router();

// SSLCommerz public callback endpoints (POST and GET supported)
router.all("/sslcommerz/success", PaymentCallbackController.handleSuccess);
router.all("/sslcommerz/fail",    PaymentCallbackController.handleFail);
router.all("/sslcommerz/cancel",  PaymentCallbackController.handleCancel);
router.all("/sslcommerz/ipn",     PaymentController.handleIPN);

// Protected endpoints for client initiation
router.post("/sslcommerz/initiate",  requireAuth, PaymentController.initiateOrderPayment);
router.post("/verify-order-payment", requireAuth, PaymentController.verifyOrderPayment);

export default router;
