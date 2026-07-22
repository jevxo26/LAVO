import { Router } from "express";
import { AdminSupportController } from "../controllers/adminSupportController";
import { verifyToken } from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/roleMiddleware";

const router = Router();

// Protect administrative support & moderation endpoints
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router.get("/reviews", AdminSupportController.getAllReviews);
router.post("/reviews/:id/reply", AdminSupportController.replyToReview);

router
  .route("/announcements")
  .get(AdminSupportController.getAllAnnouncements)
  .post(AdminSupportController.createAnnouncement);

export default router;
