import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTickets = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { ticketNumber: { contains: search, mode: 'insensitive' as any } },
          { subject: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      include: {
        customer: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const formattedTickets = tickets.map(ticket => ({
    id: ticket.ticketNumber,
    customer: ticket.customer?.user?.fullName || 'Unknown Customer',
    subject: ticket.subject,
    priority: ticket.priority === 'HIGH' ? 'High' : ticket.priority === 'MEDIUM' ? 'Medium' : 'Low',
    status: ticket.status === 'OPEN' ? 'Open' : ticket.status === 'RESOLVED' ? 'Resolved' : 'Pending',
  }));

  return {
    data: formattedTickets,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createTicket = async (data: any) => {
  let customer = await prisma.customer.findFirst({ include: { user: true }});
  if (!customer) {
    const newUser = await prisma.user.create({
      data: {
        fullName: data.customer || 'Guest',
        email: `${Date.now()}@customer.com`,
        phone: '000000000',
        password: 'dummy',
        userType: 'CUSTOMER'
      }
    });
    customer = await prisma.customer.create({
      data: { userId: newUser.id, customerCode: `CUS-${Date.now()}` }
    }) as any;
  }

  let category = await prisma.ticketCategory.findFirst();
  if (!category) {
    category = await prisma.ticketCategory.create({ data: { name: 'General' }});
  }

  const newTicket = await prisma.supportTicket.create({
    data: {
      ticketNumber: `TCK-${Date.now()}`,
      customerId: customer!.id,
      categoryId: category.id,
      subject: data.subject,
      priority: data.priority ? data.priority.toUpperCase() : 'NORMAL',
      status: data.status ? data.status.toUpperCase() : 'OPEN',
    },
  });
  return newTicket;
};

export const updateTicket = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.subject) updateData.subject = data.subject;
  if (data.priority) updateData.priority = data.priority.toUpperCase();
  if (data.status) updateData.status = data.status.toUpperCase();

  const updated = await prisma.supportTicket.update({
    where: { ticketNumber: id },
    data: updateData,
  });
  return updated;
};

export const deleteTicket = async (id: string) => {
  return await prisma.supportTicket.delete({
    where: { ticketNumber: id },
  });
};
