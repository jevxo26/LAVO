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
const deliveryAgentController = __importStar(require("../controllers/deleveryAgent/deliveryAgentController"));
const availableDeliveriesController = __importStar(require("../controllers/deleveryAgent/availableDeliveriesController"));
const optimizeRouteController = __importStar(require("../controllers/deleveryAgent/optimizeRouteController"));
const verificationController = __importStar(require("../controllers/deleveryAgent/verificationController"));
const historyController = __importStar(require("../controllers/deleveryAgent/historyController"));
const router = express_1.default.Router();
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("DELIVERY_AGENT"));
router.get("/overview", deliveryAgentController.getOverview);
router.get("/available-pickups", deliveryAgentController.getAvailablePickups);
router.patch("/accept-pickup/:deliveryId", deliveryAgentController.acceptPickup);
router.get("/pickup-qrcodes/:deliveryId", deliveryAgentController.getPickupQRCodes);
router.get("/available-deliveries", availableDeliveriesController.getAvailableDeliveries);
router.patch("/accept-delivery/:deliveryId", availableDeliveriesController.acceptDelivery);
router.get("/optimized-routes", optimizeRouteController.getOptimizedRoutes);
router.get("/verifications", verificationController.getVerificationList);
router.patch("/verify-delivery/:deliveryId", verificationController.verifyDeliveryOTP);
router.get("/history", historyController.getDeliveryHistory);
exports.default = router;
