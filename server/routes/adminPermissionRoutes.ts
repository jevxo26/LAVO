import { Router } from "express";
import { AdminPermissionController } from "../controllers/adminPermissionController";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperAdmin } from "../middlewares/rbac.middleware";

const router = Router();

// Strictly SUPER_ADMIN only
router.use(requireAuth);
router.use(requireSuperAdmin);

router.get("/", AdminPermissionController.getAllAdminPermissions);
router.get("/:adminId", AdminPermissionController.getAdminPermissionById);
router.put("/:adminId", AdminPermissionController.updateAdminPermissions);

export default router;
