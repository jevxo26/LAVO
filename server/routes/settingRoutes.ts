import { Router } from 'express';
import { SettingController } from '../controllers/settingController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = Router();

// Protect all settings routes - must be logged in
// Temporarily bypass security for testing
// router.use(verifyToken);

// All settings access is restricted to Admin levels
// We restrict creation/deletion exclusively to SUPER_ADMIN to prevent tampering
router
  .route('/')
  .get(restrictTo('ADMIN', 'SUPER_ADMIN'), SettingController.getAllSettings)
  .post(restrictTo('SUPER_ADMIN'), SettingController.createSetting);

router
  .route('/:key')
  .get(restrictTo('ADMIN', 'SUPER_ADMIN'), SettingController.getSettingByKey)
  .patch(restrictTo('SUPER_ADMIN'), SettingController.updateSetting)
  .delete(restrictTo('SUPER_ADMIN'), SettingController.deleteSetting);

export default router;
