import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middlewares/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// Fetch all sessions for a user (Customer, Admin, or Branch Manager)
router.get('/sessions', verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const role = req.user.role; // CUSTOMER, ADMIN, SUPER_ADMIN, BRANCH_MANAGER

    let sessions: any[] = [];
    if (role === 'CUSTOMER') {
      sessions = await prisma.chatSession.findMany({
        where: { customerId: userId },
        orderBy: { lastMessageAt: 'desc' },
      });
    } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      sessions = await prisma.chatSession.findMany({
        where: { targetRole: 'ADMIN' },
        orderBy: { lastMessageAt: 'desc' },
      });
    } else if (role === 'BRANCH_MANAGER') {
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
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role for chat' });
    }

    res.json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Fetch sessions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Fetch messages for a specific session
router.get('/sessions/:id/messages', verifyToken, async (req: any, res) => {
  try {
    const sessionId = req.params.id;
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new session (Customer initiates)
router.post('/sessions', verifyToken, async (req: any, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
