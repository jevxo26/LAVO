import express from "express";
import * as cmsController from "../controllers/cmsController";

const router = express.Router();

// GET routes (public/frontend)
router.get("/pages", cmsController.getAllPages);
router.get("/pages/:slug", cmsController.getPageBySlug);

// POST/PUT/DELETE routes (Admin only)
// Note: You should add an authentication middleware like protect, restrictTo('SUPER_ADMIN') here in production
router.post("/pages", cmsController.createOrUpdatePage);
router.post("/sections", cmsController.updateSection);
router.post("/items", cmsController.createContentItem);
router.put("/items/:id", cmsController.updateContentItem);
router.delete("/items/:id", cmsController.deleteContentItem);

export default router;
