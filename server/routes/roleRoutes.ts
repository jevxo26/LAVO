import { Router } from "express";
import { RoleController } from "../controllers/roleController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Protect all RBAC management routes
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router
  .route("/")
  .get(RoleController.getAllRoles)
  .post(RoleController.createRole);

router.get("/permissions", RoleController.getAllPermissions);

router.put("/:id/permissions", RoleController.updateRolePermissions);
router.post("/user/:id/assign", RoleController.assignUserRole);

export default router;
