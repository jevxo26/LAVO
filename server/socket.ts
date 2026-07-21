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

    // Customer subscribes to their own order updates
    socket.on('joinCustomer', (customerId: string) => {
      socket.join(`customer_${customerId}`);
      console.log(`Socket ${socket.id} joined customer room: customer_${customerId}`);
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
                    customer: true,
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


        // 7. Advance Order status only when ALL garments have reached (or passed) a given stage
        // Stage hierarchy: PROCESSING → WASHING → DRYING → IRONING → FOLDING → READY_FOR_DELIVERY
        const stageHierarchy = ['PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING', 'READY_FOR_DELIVERY'];
        const stageIndex = stageHierarchy.indexOf(data.status);

        const allGarments = order.items.flatMap((item: any) => item.garmentItems);

        // Helper: is garment at or past a given stage?
        const atOrPast = (garmentStatus: string, targetStage: string): boolean => {
          const gi = stageHierarchy.indexOf(garmentStatus);
          const ti = stageHierarchy.indexOf(targetStage);
          if (ti === -1) return false;
          if (gi === -1) return false;
          return gi >= ti;
        };

        // --- COLLECTED → PICKUP (all garments collected) ---
        if (data.status === 'COLLECTED' && (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED')) {
          const allCollected = allGarments.every((g: any) =>
            g.id === garmentItem.id ||
            ['COLLECTED', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING', 'READY_FOR_DELIVERY'].includes(g.status)
          );
          if (allCollected) {
            await prisma.order.update({ where: { id: order.id }, data: { orderStatus: 'PICKUP' } });
            await prisma.orderTimeline.create({ data: { orderId: order.id, status: 'PICKUP', description: 'All garments collected by delivery agent.' } });
            io.to(`customer_${order.customer.userId}`).emit('orderStatusUpdated', { orderId: order.id, orderStatus: 'PICKUP' });
            console.log(`Order ${order.orderNumber} → PICKUP`);
          }
        }

        // --- Intermediate stages: only advance when ALL garments are at or past the scanned stage ---
        if (stageIndex !== -1) {
          const allAtOrPast = allGarments.every((g: any) =>
            g.id === garmentItem.id ? true : atOrPast(g.status, data.status)
          );

          if (allAtOrPast && order.orderStatus !== data.status) {
            // Only advance if order hasn't already been set to this stage or beyond
            const orderStageIndex = stageHierarchy.indexOf(order.orderStatus);
            if (orderStageIndex < stageIndex || orderStageIndex === -1) {

              const stageDescriptions: Record<string, string> = {
                PROCESSING:         'All garments are now sorting at the centralized branch hub.',
                WASHING:            'All garments have entered washing / dry-cleaning cycles.',
                DRYING:             'All garments are being dried.',
                IRONING:            'All garments are being pressed and ironed.',
                FOLDING:            'All garments are folded and packed for delivery.',
                READY_FOR_DELIVERY: 'All garments are ready. A delivery agent has been assigned.',
              };

              await prisma.order.update({ where: { id: order.id }, data: { orderStatus: data.status } });
              await prisma.orderTimeline.create({
                data: {
                  orderId: order.id,
                  status: data.status,
                  description: stageDescriptions[data.status] || `Order advanced to ${data.status}.`,
                }
              });
              io.to(`customer_${order.customer.userId}`).emit('orderStatusUpdated', { orderId: order.id, orderStatus: data.status });
              console.log(`Order ${order.orderNumber} → ${data.status} (all garments confirmed)`);

              // When all garments reach PROCESSING, mark pickup delivery as COLLECTED
              if (data.status === 'PROCESSING') {
                const pickupDelivery = await prisma.delivery.findFirst({
                  where: { orderId: order.id, deliveryType: 'PICKUP' }
                });
                if (pickupDelivery && pickupDelivery.deliveryStatus !== 'COLLECTED') {
                  await prisma.delivery.update({ where: { id: pickupDelivery.id }, data: { deliveryStatus: 'COLLECTED' } });
                }
              }

              // When all garments are READY_FOR_DELIVERY, auto-assign DROP_OFF agent
              if (data.status === 'READY_FOR_DELIVERY') {
                try {
                  const { DeliveryAssignmentService } = await import('./services/deleveryAgent/deliveryAssignmentService');
                  await DeliveryAssignmentService.autoAssignDropoffDelivery(order.id);
                } catch (e) {
                  console.error('Auto-assign dropoff failed:', e);
                }
                io.to(`branch_${data.branchId}`).emit('orderReadyForDelivery', { orderId: order.id, orderNumber: order.orderNumber });
                console.log(`✅ All garments READY — Order ${order.orderNumber} auto-assigned for DROP_OFF delivery!`);
              }
            }
          } else if (!allAtOrPast) {
            const done = allGarments.filter((g: any) =>
              g.id === garmentItem.id ? true : atOrPast(g.status, data.status)
            ).length;
            console.log(`Order ${order.orderNumber}: ${done}/${allGarments.length} garments at ${data.status} — waiting for rest.`);
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
