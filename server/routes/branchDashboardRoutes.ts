import express from 'express';
import * as branchDashboardController from '../controllers/branchDashboardController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Only allow Branch Managers and Admins to access these routes
router.use(verifyToken);
router.use(restrictTo('BRANCH_MANAGER', 'Branch Manager', 'ADMIN', 'Admin', 'SUPER_ADMIN'));

// Note: In a real app, the branchId would be derived from the logged-in BRANCH_MANAGER's profile.
// For the admin viewing it, we allow passing ?branchId=xxx
router.get('/overview', branchDashboardController.getOverview);
router.get('/orders', branchDashboardController.getOrders);
router.get('/employees', branchDashboardController.getEmployees);
router.post('/employees', branchDashboardController.createEmployee);
router.patch('/employees/:id', branchDashboardController.updateEmployee);
router.delete('/employees/:id', branchDashboardController.deleteEmployee);

router.get('/inventory', branchDashboardController.getInventory);
router.post('/inventory', branchDashboardController.createInventory);
router.patch('/inventory/:id', branchDashboardController.updateInventory);
router.delete('/inventory/:id', branchDashboardController.deleteInventory);

router.get('/delivery-agents', branchDashboardController.getDeliveryAgents);
router.post('/delivery-agents', branchDashboardController.createDeliveryAgent);
router.patch('/delivery-agents/:id', branchDashboardController.updateDeliveryAgent);
router.delete('/delivery-agents/:id', branchDashboardController.deleteDeliveryAgent);
router.get('/analytics', branchDashboardController.getAnalytics);

export default router;
