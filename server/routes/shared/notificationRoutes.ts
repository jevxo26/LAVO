import { Router } from "express";
import { NotificationController } from "../../controllers/shared/notificationController";
import { verifyToken } from "../../middlewares/authMiddleware";

const router = Router();

// Protected: Register or update device FCM token for authenticated user
router.post("/register-token", verifyToken, NotificationController.registerToken);

export default router;
