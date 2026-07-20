"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ticketController_1 = require("../controllers/ticketController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All ticket routes require authentication
router.use(authMiddleware_1.verifyToken);
router.route('/')
    .get(ticketController_1.TicketController.getTickets)
    .post(ticketController_1.TicketController.createTicket);
router.route('/assignees')
    .get(ticketController_1.TicketController.getAssignableUsers);
router.route('/:id')
    .get(ticketController_1.TicketController.getTicketDetails);
router.route('/:id/status')
    .patch(ticketController_1.TicketController.updateTicketStatus);
router.route('/:id/messages')
    .post(ticketController_1.TicketController.addMessage);
exports.default = router;
