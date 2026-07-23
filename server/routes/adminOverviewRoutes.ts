import { Router } from "express";
import { AdminOverviewController } from "../controllers/adminOverviewController";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperAdmin, restrictTo } from "../middlewares/rbac.middleware";

const router = Router();

router.use(requireAuth);

router.get("/super-admin", requireSuperAdmin, AdminOverviewController.getSuperAdminData);
router.get("/normal-admin", restrictTo("SUPER_ADMIN", "ADMIN"), AdminOverviewController.getNormalAdminData);

export default router;
