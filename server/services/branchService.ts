import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBranches = async (page: number = 1, limit: number = 10, search: string = '') => {
  const skip = (page - 1) * limit;
  
  // Construct the search query
  const where: Prisma.BranchWhereInput = search
    ? {
        OR: [
          { branchName: { contains: search, mode: 'insensitive' } },
          { branchCode: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  // Execute queries in a transaction for accuracy
  const [data, totalRecords] = await prisma.$transaction([
    prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.branch.count({ where })
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data,
    meta: {
      totalRecords,
      totalPages,
      currentPage: page,
      limit
    }
  };
};

export const getBranchById = async (id: string) => {
  return await prisma.branch.findUnique({
    where: { id }
  });
};

export const createBranch = async (data: any) => {
  return await prisma.branch.create({
    data: {
      branchCode: data.id || `BR-${Date.now()}`,
      branchName: data.branchName,
      branchType: 'Standard',
      country: 'Bangladesh',
      city: 'Dhaka',
      address: 'Dummy Address',
      phone: data.contact,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    }
  });
};

export const updateBranch = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.branchName) updateData.branchName = data.branchName;
  if (data.contact) updateData.phone = data.contact;
  if (data.status) updateData.status = data.status.toUpperCase();
  
  return await prisma.branch.update({
    where: { id },
    data: updateData
  });
};

export const deleteBranch = async (id: string) => {
  // Typically you'd do a soft delete, but for this basic CRUD we'll physically delete
  return await prisma.branch.delete({
    where: { id }
  });
};
