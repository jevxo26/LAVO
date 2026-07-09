import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTaxes = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { taxName: { contains: search, mode: 'insensitive' as any } },
        ],
      }
    : {};

  const [taxes, total] = await Promise.all([
    prisma.taxRule.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.taxRule.count({ where }),
  ]);

  const formattedTaxes = taxes.map(tax => ({
    id: tax.id,
    ruleName: tax.taxName,
    region: tax.country || 'Global',
    rate: tax.taxPercentage,
    status: tax.status === 'ACTIVE' ? 'Active' : 'Inactive',
  }));

  return {
    data: formattedTaxes,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createTax = async (data: any) => {
  const newTax = await prisma.taxRule.create({
    data: {
      taxName: data.ruleName,
      country: data.region || 'Global',
      taxPercentage: Number(data.rate || 0),
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    },
  });
  return newTax;
};

export const updateTax = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.ruleName) updateData.taxName = data.ruleName;
  if (data.region) updateData.country = data.region;
  if (data.rate) updateData.taxPercentage = Number(data.rate);
  if (data.status) updateData.status = data.status.toUpperCase();

  const updated = await prisma.taxRule.update({
    where: { id },
    data: updateData,
  });
  return updated;
};

export const deleteTax = async (id: string) => {
  return await prisma.taxRule.delete({
    where: { id },
  });
};
