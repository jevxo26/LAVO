import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        'https://lavo-psi.vercel.app',
        process.env.FRONTEND_URL || ''
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('A client connected:', socket.id);

    socket.on('joinBranch', (branchId: string) => {
      socket.join(`branch_${branchId}`);
      console.log(`Socket ${socket.id} joined branch room: branch_${branchId}`);
    });

    socket.on('garmentScan', async (data: { qrCode: string; status: string; employeeId: string; branchId: string }) => {
      try {
        // 1. Persist scan to GarmentScanHistory
        await prisma.garmentScanHistory.create({
          data: {
            garmentItemId: data.qrCode, // resolved below
            qrCode: data.qrCode,
            scanType: data.status,
            employeeId: data.employeeId,
            branchId: data.branchId,
          }
        }).catch(async () => {
          // If garmentItemId lookup needed, find via GarmentQRCode
          const qrRecord = await prisma.garmentQRCode.findUnique({ where: { qrCode: data.qrCode } });
          if (qrRecord) {
            await prisma.garmentScanHistory.create({
              data: {
                garmentItemId: qrRecord.garmentItemId,
                qrCode: data.qrCode,
                scanType: data.status,
                employeeId: data.employeeId,
                branchId: data.branchId,
              }
            });
            // 2. Update scan count on the QR record
            await prisma.garmentQRCode.update({
              where: { qrCode: data.qrCode },
              data: { scanCount: { increment: 1 } }
            });
          }
        });
      } catch (err) {
        console.error('Error saving garment scan:', err);
      }

      // 3. Broadcast update to Branch Manager Dashboard room
      const payload = { ...data, timestamp: new Date() };
      io.to(`branch_${data.branchId}`).emit('garmentStatusUpdated', payload);
      console.log('Scan saved and broadcast:', payload);
    });

    // Chat Events
    socket.on('joinChat', (sessionId: string) => {
      socket.join(`chat_${sessionId}`);
      console.log(`Socket ${socket.id} joined chat room: chat_${sessionId}`);
    });

    socket.on('sendMessage', async (data: { sessionId: string; senderId: string; senderRole: string; content: string }) => {
      try {
        console.log("📨 Received sendMessage:", data);
        
        // Save to DB
        const message = await prisma.chatMessage.create({
          data: {
            sessionId: data.sessionId,
            senderId: data.senderId,
            senderRole: data.senderRole || 'CUSTOMER',
            content: data.content,
          }
        });

        console.log("✅ Message saved to DB:", message.id);

        // Update lastMessage on Session
        await prisma.chatSession.update({
          where: { id: data.sessionId },
          data: {
            lastMessage: data.content,
            lastMessageAt: new Date(),
          }
        });

        // Broadcast to everyone in the room
        io.to(`chat_${data.sessionId}`).emit('newMessage', message);
        console.log(`📢 Broadcasted newMessage to room chat_${data.sessionId}`);
        
        // Notify admin/branch manager UI to update session list
        io.emit('chatSessionUpdated', data.sessionId);
      } catch (err) {
        console.error('❌ Error saving chat message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
