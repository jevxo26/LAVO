"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Restrict BI & analytics endpoints to Super Admins & Admins
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router.get("/overview", analyticsController_1.AnalyticsController.getOverviewStats);
router.get("/charts", analyticsController_1.AnalyticsController.getChartData);
router.get("/export", analyticsController_1.AnalyticsController.exportReport);
exports.default = router;
