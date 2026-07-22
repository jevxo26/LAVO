import { Router } from "express";
import { AdminVendorController } from "../controllers/adminVendorController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Protect administrative vendor control endpoints
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router.get("/pending", AdminVendorController.getPendingVerifications);
router.put("/:id/verify", AdminVendorController.verifyVendor);

router.get("/payouts", AdminVendorController.getPayoutRequests);
router.put("/payouts/:id/process", AdminVendorController.processPayout);

export default router;
