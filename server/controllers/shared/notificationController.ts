import { Response } from "express";
import { AuthRequest } from "../../middlewares/authMiddleware";
import { NotificationService } from "../../services/notification/NotificationService";

export class NotificationController {
  /**
   * Protected endpoint: POST /api/notifications/register-token
   */
  static async registerToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.userId;
      const { token } = req.body;

      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized. Authentication required." });
        return;
      }

      if (!token || typeof token !== "string" || token.trim() === "") {
        res.status(400).json({ success: false, message: "Valid FCM token is required." });
        return;
      }

      const success = await NotificationService.registerUserToken(userId, token.trim());

      if (success) {
        res.status(200).json({
          success: true,
          message: "FCM device token registered successfully.",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to register FCM device token.",
        });
      }
    } catch (err: any) {
      console.error("[NotificationController.registerToken] Error:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Internal server error registering token.",
      });
    }
  }
}
