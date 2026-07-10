import express from 'express';
import * as logisticsController from '../controllers/logisticsController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Temporarily bypass security for testing
router.use(verifyToken);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.route('/agents')
  .get(logisticsController.getAllAgents)
  .post(logisticsController.createAgent);

router.route('/agents/:id')
  .patch(logisticsController.updateAgent)
  .delete(logisticsController.deleteAgent);

router.route('/vehicles')
  .get(logisticsController.getAllVehicles)
  .post(logisticsController.createVehicle);

router.route('/vehicles/:id')
  .patch(logisticsController.updateVehicle)
  .delete(logisticsController.deleteVehicle);

export default router;
