import express from 'express';
import { PaymentController } from '../controllers/paymentController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Public callback hooks from SSLCommerz (needs to bypass token verification because they are server-to-server or redirect POSTs)
router.post('/sslcommerz/success', PaymentController.handleSuccess);
router.post('/sslcommerz/fail', PaymentController.handleFail);
router.post('/sslcommerz/cancel', PaymentController.handleCancel);
router.post('/sslcommerz/ipn', PaymentController.handleIPN);

// Protected endpoints for initiating payments from client
router.post('/sslcommerz/initiate', verifyToken, PaymentController.initiateOrderPayment);
router.post('/sslcommerz/topup', verifyToken, PaymentController.initiateWalletTopup);

export default router;
