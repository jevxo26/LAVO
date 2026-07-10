import express from 'express';
import * as serviceController from '../controllers/serviceController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Temporarily bypass security for testing
router.use(verifyToken);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.route('/')
  .get(serviceController.getAllServices)
  .post(serviceController.createService);

router.route('/:id')
  .patch(serviceController.updateService)
  .delete(serviceController.deleteService);

export default router;
