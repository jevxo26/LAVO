"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getAllTickets = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllTickets = async (page = 1, limit = 10, search = '') => {
    const skip = (page - 1) * limit;
    const where = search
        ? {
            OR: [
                { ticketNumber: { contains: search, mode: 'insensitive' } },
                { subject: { contains: search, mode: 'insensitive' } },
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
    const formattedTickets = tickets.map(ticket => {
        var _a, _b;
        return ({
            id: ticket.ticketNumber,
            customer: ((_b = (_a = ticket.customer) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.fullName) || 'Unknown Customer',
            subject: ticket.subject,
            priority: ticket.priority === 'HIGH' ? 'High' : ticket.priority === 'MEDIUM' ? 'Medium' : 'Low',
            status: ticket.status === 'OPEN' ? 'Open' : ticket.status === 'RESOLVED' ? 'Resolved' : 'Pending',
        });
    });
    return {
        data: formattedTickets,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
};
exports.getAllTickets = getAllTickets;
const createTicket = async (data) => {
    let customer = await prisma.customer.findFirst({ include: { user: true } });
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
        });
    }
    let category = await prisma.ticketCategory.findFirst();
    if (!category) {
        category = await prisma.ticketCategory.create({ data: { name: 'General' } });
    }
    const newTicket = await prisma.supportTicket.create({
        data: {
            ticketNumber: `TCK-${Date.now()}`,
            customerId: customer.id,
            categoryId: category.id,
            subject: data.subject,
            priority: data.priority ? data.priority.toUpperCase() : 'NORMAL',
            status: data.status ? data.status.toUpperCase() : 'OPEN',
        },
    });
    return newTicket;
};
exports.createTicket = createTicket;
const updateTicket = async (id, data) => {
    const updateData = {};
    if (data.subject)
        updateData.subject = data.subject;
    if (data.priority)
        updateData.priority = data.priority.toUpperCase();
    if (data.status)
        updateData.status = data.status.toUpperCase();
    const updated = await prisma.supportTicket.update({
        where: { ticketNumber: id },
        data: updateData,
    });
    return updated;
};
exports.updateTicket = updateTicket;
const deleteTicket = async (id) => {
    return await prisma.supportTicket.delete({
        where: { ticketNumber: id },
    });
};
exports.deleteTicket = deleteTicket;
