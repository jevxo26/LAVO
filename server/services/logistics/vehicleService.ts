import { PrismaClient } from '@prisma/client';
import { createAgent } from './agentService';

const prisma = new PrismaClient();

export const getAllVehicles = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { vehicleNumber: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [vehicles, total] = await Promise.all([
    prisma.deliveryVehicle.findMany({
      where,
      skip,
      take: limit,
      include: {
        agent: {
          include: { user: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deliveryVehicle.count({ where }),
  ]);

  const formattedVehicles = vehicles.map(vehicle => ({
    id: vehicle.id,
    vehicleNumber: vehicle.vehicleNumber,
    type: vehicle.vehicleType,
    assignedAgent: vehicle.agent?.user?.fullName || 'Unassigned',
    status: vehicle.status === 'ACTIVE' ? 'Active' : vehicle.status === 'MAINTENANCE' ? 'Maintenance' : 'Inactive',
  }));

  return {
    data: formattedVehicles,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createVehicle = async (data: any) => {
  // Find or create dummy agent
  let agent = await prisma.deliveryAgent.findFirst();
  if (!agent) {
    agent = await createAgent({ name: data.assignedAgent || 'Default Agent', phone: `017${Math.floor(Math.random() * 100000000)}` });
  }

  if (data.vehicleNumber) {
    const existing = await prisma.deliveryVehicle.findUnique({ where: { vehicleNumber: data.vehicleNumber } });
    if (existing) throw new Error('Vehicle already exists with this number');
  }

  const newVehicle = await prisma.deliveryVehicle.create({
    data: {
      agentId: agent.id,
      vehicleType: data.type || 'Bike',
      vehicleNumber: data.vehicleNumber,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    },
  });
  return newVehicle;
};

export const updateVehicle = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.vehicleNumber) updateData.vehicleNumber = data.vehicleNumber;
  if (data.type) updateData.vehicleType = data.type;
  if (data.status) updateData.status = data.status.toUpperCase();

  const updated = await prisma.deliveryVehicle.update({
    where: { id },
    data: updateData,
  });
  return updated;
};

export const deleteVehicle = async (id: string) => {
  return await prisma.deliveryVehicle.delete({
    where: { id },
  });
};
