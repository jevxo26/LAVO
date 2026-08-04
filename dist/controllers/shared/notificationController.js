"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const NotificationService_1 = require("../../services/notification/NotificationService");
class NotificationController {
    /**
     * Protected endpoint: POST /api/notifications/register-token
     */
    static async registerToken(req, res) {
        var _a, _b;
        try {
            const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId);
            const { token } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: "Unauthorized. Authentication required." });
                return;
            }
            if (!token || typeof token !== "string" || token.trim() === "") {
                res.status(400).json({ success: false, message: "Valid FCM token is required." });
                return;
            }
            const success = await NotificationService_1.NotificationService.registerUserToken(userId, token.trim());
            if (success) {
                res.status(200).json({
                    success: true,
                    message: "FCM device token registered successfully.",
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: "Failed to register FCM device token.",
                });
            }
        }
        catch (err) {
            console.error("[NotificationController.registerToken] Error:", err);
            res.status(500).json({
                success: false,
                message: err.message || "Internal server error registering token.",
            });
        }
    }
}
exports.NotificationController = NotificationController;
