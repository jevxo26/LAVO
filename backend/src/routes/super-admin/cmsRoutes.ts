import express from "express";
import * as cmsController from "../../controllers/super-admin/cmsController";
import { verifyToken } from "../../middlewares/authMiddleware";
import { restrictTo } from "../../middlewares/roleMiddleware";

const router = express.Router();

// GET routes (public for website frontend rendering)
router.get("/pages", cmsController.getAllPages);
router.get("/pages/:slug", cmsController.getPageBySlug);

// Protected POST/PUT/DELETE routes (Super Admin / Admin only)
router.use(verifyToken);
router.use(restrictTo("SUPER_ADMIN", "ADMIN"));

router.post("/pages", cmsController.createOrUpdatePage);
router.post("/sections", cmsController.updateSection);
router.post("/items", cmsController.createContentItem);
router.put("/items/:id", cmsController.updateContentItem);
router.delete("/items/:id", cmsController.deleteContentItem);

export default router;
