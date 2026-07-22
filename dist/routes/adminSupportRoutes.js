"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminSupportController_1 = require("../controllers/adminSupportController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect administrative support & moderation endpoints
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router.get("/reviews", adminSupportController_1.AdminSupportController.getAllReviews);
router.post("/reviews/:id/reply", adminSupportController_1.AdminSupportController.replyToReview);
router
    .route("/announcements")
    .get(adminSupportController_1.AdminSupportController.getAllAnnouncements)
    .post(adminSupportController_1.AdminSupportController.createAnnouncement);
exports.default = router;
