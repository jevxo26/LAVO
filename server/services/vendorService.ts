import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllVendors = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;
  const where = search ? { OR: [{ businessName: { contains: search, mode: 'insensitive' as any } }, { ownerName: { contains: search, mode: 'insensitive' as any } }, { vendorCode: { contains: search, mode: 'insensitive' as any } }] } : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({ where, skip, take: limit, include: { rating: true }, orderBy: { createdAt: 'desc' } }),
    prisma.vendor.count({ where }),
  ]);

  return {
    data: vendors.map(vendor => ({
      id: vendor.id, vendorName: vendor.businessName, owner: vendor.ownerName, commission: 10,
      rating: vendor.rating?.averageRating || 0,
      status: vendor.status === 'ACTIVE' ? 'Active' : vendor.status === 'PENDING' ? 'Pending' : 'Inactive',
    })),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createVendor = async (data: any) => {
  const newVendor = await prisma.vendor.create({
    data: { vendorCode: `VEN-${Date.now()}`, businessName: data.vendorName, ownerName: data.owner, email: `${Date.now()}@vendor.com`, phone: `${Date.now()}`, status: data.status ? data.status.toUpperCase() : 'ACTIVE' },
  });
  if (data.rating !== undefined) await prisma.vendorRating.create({ data: { vendorId: newVendor.id, averageRating: Number(data.rating) } });
  return newVendor;
};

export const updateVendor = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.vendorName) updateData.businessName = data.vendorName;
  if (data.owner) updateData.ownerName = data.owner;
  if (data.status) updateData.status = data.status.toUpperCase();
  const updated = await prisma.vendor.update({ where: { id }, data: updateData });
  if (data.rating !== undefined) {
    await prisma.vendorRating.upsert({
      where: { vendorId: id }, update: { averageRating: Number(data.rating) }, create: { vendorId: id, averageRating: Number(data.rating) }
    });
  }
  return updated;
};

export const deleteVendor = async (id: string) => await prisma.vendor.delete({ where: { id } });
