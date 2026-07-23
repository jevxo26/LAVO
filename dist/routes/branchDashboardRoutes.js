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
const overviewController = __importStar(require("../controllers/branch/overviewController"));
const orderController = __importStar(require("../controllers/branch/orderController"));
const employeeController = __importStar(require("../controllers/branch/employeeController"));
const inventoryController = __importStar(require("../controllers/branch/inventoryController"));
const agentController = __importStar(require("../controllers/branch/agentController"));
const qrOrderController = __importStar(require("../controllers/branch/qrOrderController"));
const branchVendorController_1 = require("../controllers/branch/branchVendorController");
const router = express_1.default.Router();
// Only allow Branch Managers and Admins to access these routes
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)('BRANCH_MANAGER', 'Branch Manager', 'ADMIN', 'Admin', 'SUPER_ADMIN'));
router.get('/overview', overviewController.getOverview);
router.get('/orders', orderController.getOrders);
router.get('/orders/:orderId/dev-otp', orderController.getDevOTP);
router.put('/orders/:orderId/ready-for-delivery', orderController.markOrderReadyForDelivery);
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
router.get('/vendors', branchVendorController_1.BranchVendorController.getBranchVendors);
router.post('/vendors/assign-order', branchVendorController_1.BranchVendorController.assignOrderToVendor);
exports.default = router;
