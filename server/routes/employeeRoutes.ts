import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';
import * as employeeOrderController from '../controllers/employee/employeeOrderController';

const router = express.Router();

router.use(verifyToken);
router.use(restrictTo('EMPLOYEE', 'Employee', 'BRANCH_MANAGER', 'Branch Manager', 'ADMIN', 'Admin', 'SUPER_ADMIN'));

// Get orders that have been picked up and are awaiting QR tagging / processing
router.get('/orders', employeeOrderController.getPickupOrders);

// Get garment items (and their QR codes) for a specific order
router.get('/orders/:orderId/qr-codes', employeeOrderController.getOrderQrCodes);

// Generate QR code for a garment item
router.post('/garment-items/:garmentItemId/generate-qr', employeeOrderController.generateQrCode);

// Generate QR codes for ALL garments in an order at once
router.post('/orders/:orderId/generate-all-qr', employeeOrderController.generateAllQrCodes);

// Fetch current garment status by QR code (used by scanner to disable already-applied stage button)
router.get('/garment-status', employeeOrderController.getGarmentStatus);

export default router;
