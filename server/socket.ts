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
        // 1. Look up the garment via its QR code record
        const qrRecord = await prisma.garmentQRCode.findUnique({
          where: { qrCode: data.qrCode },
        });

        if (!qrRecord) {
          socket.emit('scanError', { message: 'QR code not found in system.' });
          return;
        }

        // 2. Fetch the full garment item with order context
        const garmentItem = await prisma.garmentItem.findUnique({
          where: { id: qrRecord.garmentItemId },
          include: {
            orderItem: {
              include: {
                order: {
                  include: {
                    items: {
                      include: { garmentItems: true }
                    }
                  }
                }
              }
            }
          }
        }) as any;

        if (!garmentItem) {
          socket.emit('scanError', { message: 'Garment item not found.' });
          return;
        }

        const order = garmentItem.orderItem.order;

        // 3. Update the GarmentItem status
        await prisma.garmentItem.update({
          where: { id: garmentItem.id },
          data: { status: data.status }
        });

        // 4. Update scan count on QR record
        await prisma.garmentQRCode.update({
          where: { qrCode: data.qrCode },
          data: { scanCount: { increment: 1 } }
        });

        // 5. Persist scan to GarmentScanHistory
        await prisma.garmentScanHistory.create({
          data: {
            garmentItemId: garmentItem.id,
            qrCode: data.qrCode,
            scanType: data.status,
            employeeId: data.employeeId,
            branchId: data.branchId,
          }
        });

        // 6. Broadcast live update to Branch Manager Dashboard
        const payload = { ...data, garmentName: garmentItem.garmentName, orderNumber: order.orderNumber, timestamp: new Date() };
        io.to(`branch_${data.branchId}`).emit('garmentStatusUpdated', payload);
        console.log('Scan saved and broadcast:', payload);

        // 7. Update Order status based on intermediate garment scans (Sorting/Washing)
        const processingEligible = ['PENDING', 'CONFIRMED', 'PICKUP'];
        const washingEligible = ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING'];

        if (data.status === 'PROCESSING' && processingEligible.includes(order.orderStatus)) {
          // The first garment entered Processing -> update the Order
          await prisma.order.update({
            where: { id: order.id },
            data: { orderStatus: 'PROCESSING' }
          });
          await prisma.orderTimeline.create({
            data: {
              orderId: order.id,
              status: 'PROCESSING',
              description: 'Laundry items sorting at centralized branch hub.',
            }
          });
          console.log(`Order ${order.orderNumber} advanced to PROCESSING`);
        } else if (data.status === 'WASHING' && washingEligible.includes(order.orderStatus)) {
          // The first garment entered Washing -> update the Order
          // If we skipped PROCESSING, we could insert both timelines, but let's just update status to WASHING
          await prisma.order.update({
            where: { id: order.id },
            data: { orderStatus: 'WASHING' }
          });
          
          // Optionally backfill PROCESSING timeline if missed
          if (processingEligible.includes(order.orderStatus)) {
            await prisma.orderTimeline.create({
              data: {
                orderId: order.id,
                status: 'PROCESSING',
                description: 'Laundry items sorting at centralized branch hub.',
              }
            });
          }

          await prisma.orderTimeline.create({
            data: {
              orderId: order.id,
              status: 'WASHING',
              description: 'Garments undergoing washing / dry-cleaning cycles.',
            }
          });
          console.log(`Order ${order.orderNumber} advanced to WASHING`);
        }

        // 8. THE MAGIC TRIGGER: Check if ALL garments in this order are now READY
        if (data.status === 'READY_FOR_DELIVERY') {
          const allGarments = order.items.flatMap((item: any) => item.garmentItems);
          const allReady = allGarments.every((g: any) => g.id === garmentItem.id || g.status === 'READY_FOR_DELIVERY');

          if (allReady && order.orderStatus !== 'READY_FOR_DELIVERY') {
            // Update order status
            await prisma.order.update({
              where: { id: order.id },
              data: { orderStatus: 'READY_FOR_DELIVERY' }
            });

            // Auto-assign a DROP_OFF delivery agent
            try {
              const { DeliveryAssignmentService } = await import('./services/deleveryAgent/deliveryAssignmentService');
              await DeliveryAssignmentService.autoAssignDropoffDelivery(order.id);
            } catch (e) {
              console.error('Auto-assign dropoff failed:', e);
            }

            // Notify the branch manager dashboard
            io.to(`branch_${data.branchId}`).emit('orderReadyForDelivery', { orderId: order.id, orderNumber: order.orderNumber });
            console.log(`✅ All garments READY — Order ${order.orderNumber} auto-assigned for DROP_OFF delivery!`);
          }
        }

      } catch (err) {
        console.error('Error saving garment scan:', err);
        socket.emit('scanError', { message: 'An error occurred while processing the scan.' });
      }
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
