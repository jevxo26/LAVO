import express from 'express';
import * as supportController from '../controllers/supportController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Temporarily bypass security for testing
// router.use(verifyToken);
// router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.route('/tickets')
  .get(supportController.getAllTickets)
  .post(supportController.createTicket);

router.route('/tickets/:id')
  .patch(supportController.updateTicket)
  .delete(supportController.deleteTicket);

router.route('/reviews')
  .get(supportController.getAllReviews)
  .post(supportController.createReview);

router.route('/reviews/:id')
  .patch(supportController.updateReview)
  .delete(supportController.deleteReview);

export default router;
