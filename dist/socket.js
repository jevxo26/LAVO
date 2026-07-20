"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
    io.on('connection', (socket) => {
        console.log('A client connected:', socket.id);
        socket.on('joinBranch', (branchId) => {
            socket.join(`branch_${branchId}`);
            console.log(`Socket ${socket.id} joined branch room: branch_${branchId}`);
        });
        socket.on('garmentScan', async (data) => {
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
                });
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
                const payload = Object.assign(Object.assign({}, data), { garmentName: garmentItem.garmentName, orderNumber: order.orderNumber, timestamp: new Date() });
                io.to(`branch_${data.branchId}`).emit('garmentStatusUpdated', payload);
                console.log('Scan saved and broadcast:', payload);
                // 7. Update Order status based on intermediate garment scans
                const processingEligible = ['PENDING', 'CONFIRMED', 'PICKUP'];
                const washingEligible = ['PENDING', 'CONFIRMED', 'PICKUP', 'PROCESSING'];
                if (data.status === 'COLLECTED' && (order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED')) {
                    const allGarments = order.items.flatMap((item) => item.garmentItems);
                    const allCollected = allGarments.every((g) => g.id === garmentItem.id || g.status === 'COLLECTED' || g.status === 'PROCESSING' || g.status === 'WASHING' || g.status === 'READY_FOR_DELIVERY');
                    if (allCollected) {
                        await prisma.order.update({
                            where: { id: order.id },
                            data: { orderStatus: 'PICKUP' }
                        });
                        await prisma.orderTimeline.create({
                            data: {
                                orderId: order.id,
                                status: 'PICKUP',
                                description: 'All garments collected by delivery agent.',
                            }
                        });
                        console.log(`Order ${order.orderNumber} advanced to PICKUP (Collected by Agent)`);
                    }
                }
                else if (data.status === 'PROCESSING' && processingEligible.includes(order.orderStatus)) {
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
                    // Complete the pickup delivery
                    const pickupDelivery = await prisma.delivery.findFirst({
                        where: { orderId: order.id, deliveryType: 'PICKUP' }
                    });
                    if (pickupDelivery && pickupDelivery.deliveryStatus !== 'COLLECTED') {
                        await prisma.delivery.update({
                            where: { id: pickupDelivery.id },
                            data: { deliveryStatus: 'COLLECTED' }
                        });
                    }
                    console.log(`Order ${order.orderNumber} advanced to PROCESSING`);
                }
                else if (data.status === 'WASHING' && washingEligible.includes(order.orderStatus)) {
                    // The first garment entered Washing -> update the Order
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
                    const allGarments = order.items.flatMap((item) => item.garmentItems);
                    const allReady = allGarments.every((g) => g.id === garmentItem.id || g.status === 'READY_FOR_DELIVERY');
                    if (allReady && order.orderStatus !== 'READY_FOR_DELIVERY') {
                        // Update order status
                        await prisma.order.update({
                            where: { id: order.id },
                            data: { orderStatus: 'READY_FOR_DELIVERY' }
                        });
                        // Auto-assign a DROP_OFF delivery agent
                        try {
                            const { DeliveryAssignmentService } = await Promise.resolve().then(() => __importStar(require('./services/deleveryAgent/deliveryAssignmentService')));
                            await DeliveryAssignmentService.autoAssignDropoffDelivery(order.id);
                        }
                        catch (e) {
                            console.error('Auto-assign dropoff failed:', e);
                        }
                        // Notify the branch manager dashboard
                        io.to(`branch_${data.branchId}`).emit('orderReadyForDelivery', { orderId: order.id, orderNumber: order.orderNumber });
                        console.log(`✅ All garments READY — Order ${order.orderNumber} auto-assigned for DROP_OFF delivery!`);
                    }
                }
            }
            catch (err) {
                console.error('Error saving garment scan:', err);
                socket.emit('scanError', { message: 'An error occurred while processing the scan.' });
            }
        });
        // Ticket Chat Events
        socket.on('joinTicketChat', (ticketId) => {
            socket.join(`ticket_${ticketId}`);
            console.log(`Socket ${socket.id} joined ticket room: ticket_${ticketId}`);
        });
        socket.on('sendTicketMessage', async (data) => {
            try {
                console.log("📨 Received sendTicketMessage:", data);
                const ticket = await prisma.ticket.findUnique({
                    where: { id: data.ticketId }
                });
                if (!ticket) {
                    console.error(`❌ Ticket not found: ${data.ticketId}`);
                    return;
                }
                if (ticket.status !== 'enabled-live-chat') {
                    console.error(`❌ Ticket chat is not active (status: ${ticket.status})`);
                    return;
                }
                const message = await prisma.ticketChatMessage.create({
                    data: {
                        ticketId: data.ticketId,
                        senderId: data.senderId,
                        senderRole: data.senderRole || 'CUSTOMER',
                        content: data.content,
                    }
                });
                console.log("✅ Ticket message saved to DB:", message.id);
                io.to(`ticket_${data.ticketId}`).emit('newTicketMessage', {
                    id: message.id,
                    content: message.content,
                    createdAt: message.createdAt,
                    senderId: message.senderId,
                    senderRole: message.senderRole,
                });
                console.log(`📢 Broadcasted newTicketMessage to room ticket_${data.ticketId}`);
            }
            catch (err) {
                console.error('❌ Error saving ticket chat message:', err);
            }
        });
        // Chat Events
        socket.on('joinChat', (sessionId) => {
            socket.join(`chat_${sessionId}`);
            console.log(`Socket ${socket.id} joined chat room: chat_${sessionId}`);
        });
        socket.on('sendMessage', async (data) => {
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
            }
            catch (err) {
                console.error('❌ Error saving chat message:', err);
            }
        });
        socket.on('disconnect', () => {
            console.log('A client disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io)
        throw new Error('Socket.io not initialized!');
    return io;
};
exports.getIO = getIO;
