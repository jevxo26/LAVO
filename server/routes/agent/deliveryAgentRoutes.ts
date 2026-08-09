import express from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { restrictTo } from "../../middlewares/roleMiddleware";
import * as deliveryAgentController from "../../controllers/agent/deliveryAgentController";
import * as availableDeliveriesController from "../../controllers/agent/availableDeliveriesController";
import * as optimizeRouteController from "../../controllers/agent/optimizeRouteController";
import * as verificationController from "../../controllers/agent/verificationController";
import * as historyController from "../../controllers/agent/historyController";

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

router.patch(
  "/decline-pickup/:deliveryId",
  deliveryAgentController.declinePickup
);


router.get(
  "/available-deliveries",
  availableDeliveriesController.getAvailableDeliveries
);

router.patch(
  "/accept-delivery/:deliveryId",
  availableDeliveriesController.acceptDelivery
);

router.patch(
  "/decline-delivery/:deliveryId",
  availableDeliveriesController.declineDelivery
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