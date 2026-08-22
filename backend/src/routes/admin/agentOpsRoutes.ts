import express from "express";
import { getLiveTrackingData } from "../../controllers/admin/agentOpsController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = express.Router();

// Allow authenticated users (Admins / Super Admins) to view agent live tracking
router.use(verifyToken);

router.get("/live-tracking", getLiveTrackingData);

export default router;
