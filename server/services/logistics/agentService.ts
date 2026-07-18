import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllAgents = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { user: { fullName: { contains: search, mode: 'insensitive' as any } } },
          { employeeCode: { contains: search, mode: 'insensitive' as any } },
          { phone: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [agents, total] = await Promise.all([
    prisma.deliveryAgent.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deliveryAgent.count({ where }),
  ]);

  const formattedAgents = agents.map(agent => ({
    id: agent.employeeCode,
    name: agent.user?.fullName || 'Unknown',
    phone: agent.phone,
    zone: 'Default Zone', // Not directly tied in simple schema
    status: agent.status === 'ACTIVE' ? 'Active' : agent.status === 'PENDING' ? 'Pending' : 'Inactive',
  }));

  return {
    data: formattedAgents,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createAgent = async (data: any) => {
  const phone = data.phone || `017${Math.floor(Math.random() * 100000000)}`;
  if (await prisma.user.findUnique({ where: { phone } })) throw new Error('Agent already exists with this phone number');
  
  const newUser = await prisma.user.create({
    data: {
      fullName: data.name,
      email: `${Date.now()}@agent.com`,
      phone: phone,
      // TODO: Generate secure password or use invite link
      password: 'dummy_password',
      userType: 'DELIVERY_AGENT'
    }
  });

  const newAgent = await prisma.deliveryAgent.create({
    data: {
      userId: newUser.id,
      employeeCode: `AG-${Date.now()}`,
      phone: data.phone,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    },
  });
  return newAgent;
};

export const updateAgent = async (id: string, data: any) => {
  const agent = await prisma.deliveryAgent.findUnique({ where: { employeeCode: id } });
  if (!agent) throw new Error("Agent not found");

  if (data.name) {
    await prisma.user.update({
      where: { id: agent.userId },
      data: { fullName: data.name }
    });
  }

  const updated = await prisma.deliveryAgent.update({
    where: { employeeCode: id },
    data: {
      phone: data.phone,
      status: data.status ? data.status.toUpperCase() : undefined
    }
  });
  return updated;
};

export const deleteAgent = async (id: string) => {
  return await prisma.deliveryAgent.delete({
    where: { employeeCode: id },
  });
};
