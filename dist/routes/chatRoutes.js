"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Fetch all sessions for a user (Customer, Admin, or Branch Manager)
router.get('/sessions', authMiddleware_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const role = req.user.role; // CUSTOMER, ADMIN, SUPER_ADMIN, BRANCH_MANAGER
        let sessions = [];
        if (role === 'CUSTOMER') {
            sessions = await prisma.chatSession.findMany({
                where: { customerId: userId },
                orderBy: { lastMessageAt: 'desc' },
            });
        }
        else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            sessions = await prisma.chatSession.findMany({
                where: { targetRole: 'ADMIN' },
                orderBy: { lastMessageAt: 'desc' },
            });
        }
        else if (role === 'BRANCH_MANAGER') {
            // Find branch manager's branch
            const bm = await prisma.branchManager.findFirst({ where: { userId } });
            const branchFilters = bm ? [
                { branchId: bm.branchId },
                { branchId: null }
            ] : [
                { branchId: null }
            ];
            sessions = await prisma.chatSession.findMany({
                where: {
                    targetRole: 'BRANCH_MANAGER',
                    OR: branchFilters
                },
                orderBy: { lastMessageAt: 'desc' },
            });
        }
        else {
            return res.status(403).json({ success: false, message: 'Unauthorized role for chat' });
        }
        res.json({ success: true, data: sessions });
    }
    catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// Fetch messages for a specific session
router.get('/sessions/:id/messages', authMiddleware_1.verifyToken, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Create a new session (Customer initiates)
router.post('/sessions', authMiddleware_1.verifyToken, async (req, res) => {
    try {
        const customerId = req.user.userId || req.user.id;
        if (!customerId) {
            console.error("Missing customerId in token payload:", req.user);
            return res.status(400).json({ success: false, message: "Invalid user token: userId missing" });
        }
        const { targetRole, branchId } = req.body; // targetRole: ADMIN | BRANCH_MANAGER
        const customerName = req.user.email || req.user.name || 'Customer';
        // check if OPEN session exists
        let session = await prisma.chatSession.findFirst({
            where: {
                customerId,
                targetRole,
                branchId: branchId || null,
                status: 'OPEN'
            }
        });
        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    customerId,
                    customerName,
                    targetRole,
                    branchId: branchId || null,
                    status: 'OPEN'
                }
            });
        }
        res.json({ success: true, data: session });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
