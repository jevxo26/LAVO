import { Router } from "express";
import { AuditLogController } from "../controllers/auditLogController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Protect audit log access to Super Admins & Admins
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router
  .route("/")
  .get(AuditLogController.getAllAuditLogs)
  .post(restrictTo("SUPER_ADMIN"), AuditLogController.createAuditLog);

export default router;
