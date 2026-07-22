"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLogController_1 = require("../controllers/auditLogController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect audit log access to Super Admins & Admins
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router
    .route("/")
    .get(auditLogController_1.AuditLogController.getAllAuditLogs)
    .post((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN"), auditLogController_1.AuditLogController.createAuditLog);
exports.default = router;
