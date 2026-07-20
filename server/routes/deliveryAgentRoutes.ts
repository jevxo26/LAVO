import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";
import * as deliveryAgentController from "../controllers/deleveryAgent/deliveryAgentController";
import * as availableDeliveriesController from "../controllers/deleveryAgent/availableDeliveriesController";
import * as optimizeRouteController from "../controllers/deleveryAgent/optimizeRouteController";
import * as verificationController from "../controllers/deleveryAgent/verificationController";
import * as historyController from "../controllers/deleveryAgent/historyController";

const router = express.Router();

router.use(verifyToken);
router.use(restrictTo("DELIVERY_AGENT"));

router.get(
  "/overview",
  deliveryAgentController.getOverview
);

router.get(
  "/available-pickups",
  deliveryAgentController.getAvailablePickups
);

router.patch(
  "/accept-pickup/:deliveryId",
  deliveryAgentController.acceptPickup
);

router.get(
  "/pickup-qrcodes/:deliveryId",
  deliveryAgentController.getPickupQRCodes
);

router.get(
  "/available-deliveries",
  availableDeliveriesController.getAvailableDeliveries
);

router.patch(
  "/accept-delivery/:deliveryId",
  availableDeliveriesController.acceptDelivery
);

router.get(
  "/optimized-routes",
  optimizeRouteController.getOptimizedRoutes
);

router.get(
  "/verifications",
  verificationController.getVerificationList
);

router.patch(
  "/verify-delivery/:deliveryId",
  verificationController.verifyDeliveryOTP
);

router.get(
  "/history",
  historyController.getDeliveryHistory
);

export default router;