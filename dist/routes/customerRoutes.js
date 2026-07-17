"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Allow public access to FAQs (for guest home page too)
router.get('/faqs', customerController_1.CustomerController.getFAQs);
router.get('/services/public', customerController_1.CustomerController.getServices); // public check
// Protect all other customer routes
router.use(authMiddleware_1.verifyToken);
router.get('/profile', customerController_1.CustomerController.getProfileSummary);
router.get('/services', customerController_1.CustomerController.getServices);
router.route('/orders')
    .get(customerController_1.CustomerController.getOrders)
    .post(customerController_1.CustomerController.placeOrder);
router.get('/orders/:id', customerController_1.CustomerController.getOrderDetails);
router.route('/wishlist')
    .get(customerController_1.CustomerController.getWishlist)
    .post(customerController_1.CustomerController.addToWishlist);
router.delete('/wishlist/:serviceId', customerController_1.CustomerController.removeFromWishlist);
router.route('/support/tickets')
    .get(customerController_1.CustomerController.getTickets)
    .post(customerController_1.CustomerController.createTicket);
router.route('/support/tickets/:id')
    .get(customerController_1.CustomerController.getTicketDetails);
router.post('/support/tickets/:id/messages', customerController_1.CustomerController.replyToTicket);
router.get('/wallet/transactions', customerController_1.CustomerController.getTransactions);
exports.default = router;
