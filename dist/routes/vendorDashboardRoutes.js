"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const overviewController = __importStar(require("../controllers/vendorDashboard/overviewController"));
const ordersController = __importStar(require("../controllers/vendorDashboard/ordersController"));
const servicesController = __importStar(require("../controllers/vendorDashboard/servicesController"));
const capacityController = __importStar(require("../controllers/vendorDashboard/capacityController"));
const employeesController = __importStar(require("../controllers/vendorDashboard/employeesController"));
const walletController = __importStar(require("../controllers/vendorDashboard/walletController"));
const payoutsController = __importStar(require("../controllers/vendorDashboard/payoutsController"));
const performanceController = __importStar(require("../controllers/vendorDashboard/performanceController"));
const router = express_1.default.Router();
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)('VENDOR', 'ADMIN', 'SUPER_ADMIN'));
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
exports.default = router;
