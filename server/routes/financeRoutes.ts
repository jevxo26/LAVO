import express from 'express';
import * as financeController from '../controllers/financeController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Temporarily bypass security for testing
// router.use(verifyToken);
// router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.route('/taxes')
  .get(financeController.getAllTaxes)
  .post(financeController.createTax);

router.route('/taxes/:id')
  .patch(financeController.updateTax)
  .delete(financeController.deleteTax);

router.route('/delivery-charges')
  .get(financeController.getAllDeliveryCharges)
  .post(financeController.createDeliveryCharge);

router.route('/delivery-charges/:id')
  .patch(financeController.updateDeliveryCharge)
  .delete(financeController.deleteDeliveryCharge);

export default router;
