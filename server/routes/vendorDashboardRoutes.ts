import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';
import * as overviewController from '../controllers/vendorDashboard/overviewController';
import * as ordersController from '../controllers/vendorDashboard/ordersController';
import * as servicesController from '../controllers/vendorDashboard/servicesController';
import * as capacityController from '../controllers/vendorDashboard/capacityController';
import * as employeesController from '../controllers/vendorDashboard/employeesController';
import * as walletController from '../controllers/vendorDashboard/walletController';
import * as payoutsController from '../controllers/vendorDashboard/payoutsController';
import * as performanceController from '../controllers/vendorDashboard/performanceController';

const router = express.Router();

router.use(verifyToken);
router.use(restrictTo('VENDOR', 'ADMIN', 'SUPER_ADMIN'));

// Overview
router.get('/overview', overviewController.getOverview);

// Orders
router.get('/orders', ordersController.getOrders);
router.patch('/orders/:orderId/status', ordersController.updateOrderStatus);
router.patch('/orders/:orderId/accept', ordersController.acceptOrder);
router.patch('/orders/:orderId/reject', ordersController.rejectOrder);

// Services
router.get('/services', servicesController.getServices);
router.patch('/services/:serviceId', servicesController.updateService);
router.patch('/services/:serviceId/toggle', servicesController.toggleServiceStatus);

// Capacity
router.get('/capacity', capacityController.getCapacity);
router.patch('/capacity', capacityController.updateCapacity);

// Employees
router.get('/employees', employeesController.getEmployees);
router.post('/employees', employeesController.createEmployee);
router.patch('/employees/:id', employeesController.updateEmployee);
router.delete('/employees/:id', employeesController.deleteEmployee);

// Wallet
router.get('/wallet', walletController.getWallet);

// Payouts
router.get('/payouts', payoutsController.getPayouts);
router.post('/payouts', payoutsController.requestPayout);

// Performance
router.get('/performance', performanceController.getPerformance);

export default router;
