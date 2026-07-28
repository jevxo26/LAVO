import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createPartnerApplicationController,
  getAllPartnerApplicationsController,
  updatePartnerApplicationController
} from "../controllers/partnerApplicationController";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  restrictTo("CUSTOMER"),
  createPartnerApplicationController
);

router.get(
  "/",
  requireAuth,
  restrictTo("ADMIN", "BRANCH_MANAGER"),
  getAllPartnerApplicationsController
);
router.patch(
  "/:id",
  requireAuth,
  restrictTo("ADMIN"),
  updatePartnerApplicationController
);


export default router;