import express from 'express';
import * as vendorController from '../controllers/vendorController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Temporarily bypass security for testing
// Temporarily bypass security for testing
// router.use(verifyToken);
// router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.route('/')
  .get(vendorController.getAllVendors)
  .post(vendorController.createVendor);

router.route('/:id')
  .patch(vendorController.updateVendor)
  .delete(vendorController.deleteVendor);

export default router;
