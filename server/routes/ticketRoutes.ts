import express from 'express';
import { TicketController } from '../controllers/ticketController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

// All ticket routes require authentication
router.use(verifyToken);

router.route('/')
  .get(TicketController.getTickets)
  .post(TicketController.createTicket);

router.route('/assignees')
  .get(TicketController.getAssignableUsers);

router.route('/:id')
  .get(TicketController.getTicketDetails);

router.route('/:id/status')
  .patch(TicketController.updateTicketStatus);

router.route('/:id/messages')
  .post(TicketController.addMessage);

export default router;
