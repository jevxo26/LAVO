import express from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { restrictTo } from "../../middlewares/roleMiddleware";
import * as overviewController from "../../controllers/vendor/overviewController";
import * as ordersController from "../../controllers/vendor/ordersController";
import * as servicesController from "../../controllers/vendor/servicesController";
import * as capacityController from "../../controllers/vendor/capacityController";
import * as employeesController from "../../controllers/vendor/employeesController";
import * as walletController from "../../controllers/vendor/walletController";
import * as payoutsController from "../../controllers/vendor/payoutsController";
import * as performanceController from "../../controllers/vendor/performanceController";

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
