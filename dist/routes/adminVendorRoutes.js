"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminVendorController_1 = require("../controllers/adminVendorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect administrative vendor control endpoints
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router.get("/pending", adminVendorController_1.AdminVendorController.getPendingVerifications);
router.put("/:id/verify", adminVendorController_1.AdminVendorController.verifyVendor);
router.get("/payouts", adminVendorController_1.AdminVendorController.getPayoutRequests);
router.put("/payouts/:id/process", adminVendorController_1.AdminVendorController.processPayout);
exports.default = router;
