import express from 'express';
import { CustomerController } from '../controllers/customerController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();

// Allow public access to FAQs (for guest home page too)
router.get('/faqs', CustomerController.getFAQs);
router.get('/services/public', CustomerController.getServices); // public check

// Protect all other customer routes
router.use(verifyToken);

router.get('/profile', CustomerController.getProfileSummary);
router.get('/services', CustomerController.getServices);

router.route('/orders')
  .get(CustomerController.getOrders)
  .post(CustomerController.placeOrder);

router.get('/orders/:id', CustomerController.getOrderDetails);
router.get('/orders/:id/delivery-otp', CustomerController.getDeliveryOTP);
router.delete('/orders/:id/cancel', CustomerController.cancelOrder);

router.route('/wishlist')
  .get(CustomerController.getWishlist)
  .post(CustomerController.addToWishlist);

router.delete('/wishlist/:serviceId', CustomerController.removeFromWishlist);

router.route('/support/tickets')
  .get(CustomerController.getTickets)
  .post(CustomerController.createTicket);

router.route('/support/tickets/:id')
  .get(CustomerController.getTicketDetails);

router.post('/support/tickets/:id/messages', CustomerController.replyToTicket);

router.get('/wallet/transactions', CustomerController.getTransactions);

export default router;
