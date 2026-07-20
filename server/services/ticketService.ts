import { PrismaClient } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class TicketService {
  // Create a new ticket
  static createTicket = catchServiceAsync(async (customerId: string, data: { title: string; description: string; priority?: string; assignedTo?: string }) => {
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
  static getTickets = catchServiceAsync(async (userId: string, role: string) => {
    const uppercaseRole = role.toUpperCase();
    if (uppercaseRole === 'CUSTOMER') {
      return prisma.ticket.findMany({
        where: { customerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Admin/Branch Manager dashboards display only their assigned tickets
      return prisma.ticket.findMany({
        where: { assignedTo: userId },
        orderBy: { createdAt: 'desc' },
      });
    }
  });

  // Get ticket details and messages
  static getTicketDetails = catchServiceAsync(async (ticketId: string, userId: string, role: string) => {
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
    if (ticket.customerId) senderIds.push(ticket.customerId);
    if (ticket.assignedTo) senderIds.push(ticket.assignedTo);

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
        senderName: sender?.fullName || 'User',
        senderRole: sender?.userType || m.senderRole,
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
      assignedToName: assignedUser?.fullName || null,
      status: ticket.status,
      customerId: ticket.customerId,
      customerName: customerUser?.fullName || 'Customer',
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      messages: formattedMessages,
    };
  });

  // Update ticket status
  static updateTicketStatus = catchServiceAsync(async (ticketId: string, userId: string, role: string, status: string) => {
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
  static getAssignableUsers = catchServiceAsync(async () => {
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
  static addMessage = catchServiceAsync(async (ticketId: string, senderId: string, senderRole: string, content: string) => {
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
}
