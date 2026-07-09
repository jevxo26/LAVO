import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllServices = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;
  const where = search ? { OR: [{ serviceName: { contains: search, mode: 'insensitive' as any } }] } : {};

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where, skip, take: limit,
      include: { garmentType: { include: { category: true } }, pricings: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.service.count({ where }),
  ]);

  return {
    data: services.map(service => ({
      id: service.id, itemName: service.serviceName, category: service.garmentType?.category?.name || 'General',
      washPrice: service.basePrice || 50, dryCleanPrice: (service.basePrice || 50) * 2,
      status: service.status === 'ACTIVE' ? 'Active' : service.status === 'PENDING' ? 'Pending' : 'Inactive',
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createService = async (data: any) => {
  let category = await prisma.garmentCategory.findFirst({ where: { name: data.category || 'General' } });
  if (!category) category = await prisma.garmentCategory.create({ data: { name: data.category || 'General' } });

  let garmentType = await prisma.garmentType.findFirst({ where: { categoryId: category.id } });
  if (!garmentType) garmentType = await prisma.garmentType.create({ data: { categoryId: category.id, name: 'Standard', unitType: 'PIECE' } });

  let serviceCat = await prisma.serviceCategory.findFirst();
  if (!serviceCat) serviceCat = await prisma.serviceCategory.create({ data: { name: 'Standard Cleaning' } });

  return await prisma.service.create({
    data: { serviceName: data.itemName, serviceCategoryId: serviceCat.id, garmentTypeId: garmentType.id, basePrice: Number(data.washPrice || 0), status: data.status ? data.status.toUpperCase() : 'ACTIVE' },
  });
};

export const updateService = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.itemName) updateData.serviceName = data.itemName;
  if (data.status) updateData.status = data.status.toUpperCase();
  if (data.washPrice) updateData.basePrice = Number(data.washPrice);
  return await prisma.service.update({ where: { id }, data: updateData });
};

export const deleteService = async (id: string) => await prisma.service.delete({ where: { id } });
