import { Router } from "express";
import { verifyToken } from "../../middlewares/authMiddleware";
import { ProfileController } from "../../controllers/shared/profileController";

const router = Router();

router.use(verifyToken);

router.get("/",           ProfileController.getProfile);
router.put("/",           ProfileController.updateProfile);
router.post("/password",  ProfileController.changePassword);
router.get("/preferences",  ProfileController.getPreferences);
router.post("/preferences", ProfileController.savePreferences);

export default router;
