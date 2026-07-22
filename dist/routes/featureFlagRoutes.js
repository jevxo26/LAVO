"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const featureFlagController_1 = require("../controllers/featureFlagController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect settings & flags modification routes
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router
    .route("/")
    .get(featureFlagController_1.FeatureFlagController.getAllFeatureFlags)
    .post(featureFlagController_1.FeatureFlagController.initializeDefaults);
router.patch("/:id", featureFlagController_1.FeatureFlagController.toggleFeatureFlag);
exports.default = router;
