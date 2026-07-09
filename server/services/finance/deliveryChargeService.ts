import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDeliveryCharges = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { ruleName: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [charges, total] = await Promise.all([
    prisma.deliveryChargeRule.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.deliveryChargeRule.count({ where }),
  ]);

  const formattedCharges = charges.map(charge => ({
    id: charge.id,
    ruleName: charge.ruleName,
    zone: 'Global',
    charge: charge.baseCharge,
    status: charge.status === 'ACTIVE' ? 'Active' : 'Inactive',
  }));

  return {
    data: formattedCharges,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createDeliveryCharge = async (data: any) => {
  const newCharge = await prisma.deliveryChargeRule.create({
    data: {
      ruleName: data.ruleName,
      baseCharge: Number(data.charge || 0),
      distanceCharge: 0,
      weightCharge: 0,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    },
  });
  return newCharge;
};

export const updateDeliveryCharge = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.ruleName) updateData.ruleName = data.ruleName;
  if (data.charge) updateData.baseCharge = Number(data.charge);
  if (data.status) updateData.status = data.status.toUpperCase();

  const updated = await prisma.deliveryChargeRule.update({
    where: { id },
    data: updateData,
  });
  return updated;
};

export const deleteDeliveryCharge = async (id: string) => {
  return await prisma.deliveryChargeRule.delete({
    where: { id },
  });
};
