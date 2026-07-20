"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const client_1 = require("@prisma/client");
const catchServiceAsync_1 = require("../utils/catchServiceAsync");
const prisma = new client_1.PrismaClient();
class TicketService {
}
exports.TicketService = TicketService;
_a = TicketService;
// Create a new ticket
TicketService.createTicket = (0, catchServiceAsync_1.catchServiceAsync)(async (customerId, data) => {
    return prisma.ticket.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority || 'NORMAL',
            assignedTo: data.assignedTo || null,
            status: 'pendingReview',
            customerId,
        },
    });
});
// Get tickets list based on role (Customer: own tickets, Staff: assigned tickets)
TicketService.getTickets = (0, catchServiceAsync_1.catchServiceAsync)(async (userId, role) => {
    const uppercaseRole = role.toUpperCase();
    if (uppercaseRole === 'CUSTOMER') {
        return prisma.ticket.findMany({
            where: { customerId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    else {
        // Admin/Branch Manager dashboards display only their assigned tickets
        return prisma.ticket.findMany({
            where: { assignedTo: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
});
// Get ticket details and messages
TicketService.getTicketDetails = (0, catchServiceAsync_1.catchServiceAsync)(async (ticketId, userId, role) => {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
            },
        },
    });
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    const uppercaseRole = role.toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(uppercaseRole);
    // Authorization check
    if (ticket.customerId !== userId && ticket.assignedTo !== userId && !isAdmin) {
        throw new Error('Unauthorized access to ticket');
    }
    // Resolve sender names for the messages
    const senderIds = Array.from(new Set(ticket.messages.map((m) => m.senderId)));
    if (ticket.customerId)
        senderIds.push(ticket.customerId);
    if (ticket.assignedTo)
        senderIds.push(ticket.assignedTo);
    const users = await prisma.user.findMany({
        where: { id: { in: senderIds } },
        select: { id: true, fullName: true, userType: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const formattedMessages = ticket.messages.map((m) => {
        const sender = userMap.get(m.senderId);
        return {
            id: m.id,
            content: m.content,
            createdAt: m.createdAt,
            senderId: m.senderId,
            senderName: (sender === null || sender === void 0 ? void 0 : sender.fullName) || 'User',
            senderRole: (sender === null || sender === void 0 ? void 0 : sender.userType) || m.senderRole,
        };
    });
    const customerUser = userMap.get(ticket.customerId);
    const assignedUser = ticket.assignedTo ? userMap.get(ticket.assignedTo) : null;
    return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        assignedToName: (assignedUser === null || assignedUser === void 0 ? void 0 : assignedUser.fullName) || null,
        status: ticket.status,
        customerId: ticket.customerId,
        customerName: (customerUser === null || customerUser === void 0 ? void 0 : customerUser.fullName) || 'Customer',
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        messages: formattedMessages,
    };
});
// Update ticket status
TicketService.updateTicketStatus = (0, catchServiceAsync_1.catchServiceAsync)(async (ticketId, userId, role, status) => {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
    });
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    const uppercaseRole = role.toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(uppercaseRole);
    if (ticket.customerId !== userId && ticket.assignedTo !== userId && !isAdmin) {
        throw new Error('Unauthorized to modify ticket');
    }
    const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status },
    });
    return updated;
});
// Get active Admins and Branch Managers to assign tickets to
TicketService.getAssignableUsers = (0, catchServiceAsync_1.catchServiceAsync)(async () => {
    return prisma.user.findMany({
        where: {
            userType: { in: ['ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'] },
            status: 'ACTIVE',
        },
        select: {
            id: true,
            fullName: true,
            userType: true,
        },
        orderBy: { fullName: 'asc' },
    });
});
// Save a chat message to DB (REST API fallback)
TicketService.addMessage = (0, catchServiceAsync_1.catchServiceAsync)(async (ticketId, senderId, senderRole, content) => {
    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
    });
    if (!ticket) {
        throw new Error('Ticket not found');
    }
    if (ticket.status !== 'enabled-live-chat') {
        throw new Error('Chat is not active for this ticket.');
    }
    return prisma.ticketChatMessage.create({
        data: {
            ticketId,
            senderId,
            senderRole,
            content,
        },
    });
});
