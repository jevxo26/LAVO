import { Router } from "express";
import { AdminUserController } from "../controllers/adminUserController";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireSuperAdmin, restrictTo } from "../middlewares/rbac.middleware";

const router = Router();

router.use(requireAuth);

// GET: Allowed for both SUPER_ADMIN and ADMIN (View-only for normal admins)
router.get("/", restrictTo("SUPER_ADMIN", "ADMIN"), AdminUserController.getUsers);

// Write actions: Strictly SUPER_ADMIN only
router.post("/", requireSuperAdmin, AdminUserController.createUser);
router.put("/:id", requireSuperAdmin, AdminUserController.updateUser);
router.patch("/:id/ban", requireSuperAdmin, AdminUserController.banUser);
router.delete("/:id", requireSuperAdmin, AdminUserController.deleteUser);

export default router;
