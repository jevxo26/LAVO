import { Router } from "express";
import { FeatureFlagController } from "../controllers/featureFlagController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Protect settings & flags modification routes
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router
  .route("/")
  .get(FeatureFlagController.getAllFeatureFlags)
  .post(FeatureFlagController.initializeDefaults);

router.patch("/:id", FeatureFlagController.toggleFeatureFlag);

export default router;
