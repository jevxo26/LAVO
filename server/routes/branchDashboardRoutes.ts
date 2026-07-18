import express from 'express';

import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';
import * as overviewController from '../controllers/branch/overviewController';
import * as orderController from '../controllers/branch/orderController';
import * as employeeController from '../controllers/branch/employeeController';
import * as inventoryController from '../controllers/branch/inventoryController';
import * as agentController from '../controllers/branch/agentController';
import * as qrOrderController from '../controllers/branch/qrOrderController';

const router = express.Router();

// Only allow Branch Managers and Admins to access these routes
router.use(verifyToken);
router.use(restrictTo('BRANCH_MANAGER', 'Branch Manager', 'ADMIN', 'Admin', 'SUPER_ADMIN'));

router.get('/overview', overviewController.getOverview);
router.get('/orders', orderController.getOrders);
router.post('/orders/assign-agent', qrOrderController.assignAgentToOrder);
router.get('/orders/:orderId/qr-codes', qrOrderController.getOrderQrCodes);
router.post('/garment-items/:garmentItemId/generate-qr', qrOrderController.generateQrCode);
router.get('/employees', employeeController.getEmployees);
router.post('/employees', employeeController.createEmployee);
router.patch('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

router.get('/inventory', inventoryController.getInventory);
router.post('/inventory', inventoryController.createInventory);
router.patch('/inventory/:id', inventoryController.updateInventory);
router.delete('/inventory/:id', inventoryController.deleteInventory);

router.get('/delivery-agents', agentController.getDeliveryAgents);
router.post('/delivery-agents', agentController.createDeliveryAgent);
router.patch('/delivery-agents/:id', agentController.updateDeliveryAgent);
router.delete('/delivery-agents/:id', agentController.deleteDeliveryAgent);
router.get('/analytics', overviewController.getAnalytics);

export default router;
