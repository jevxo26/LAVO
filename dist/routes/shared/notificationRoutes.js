"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../../controllers/shared/notificationController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protected: Register or update device FCM token for authenticated user
router.post("/register-token", authMiddleware_1.verifyToken, notificationController_1.NotificationController.registerToken);
exports.default = router;
