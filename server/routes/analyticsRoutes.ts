import { Router } from "express";
import { AnalyticsController } from "../controllers/analyticsController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Restrict BI & analytics endpoints to Super Admins & Admins
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router.get("/overview", AnalyticsController.getOverviewStats);
router.get("/charts", AnalyticsController.getChartData);
router.get("/export", AnalyticsController.exportReport);

export default router;
