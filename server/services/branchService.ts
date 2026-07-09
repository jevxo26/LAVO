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

export const createBranch = async (data: Prisma.BranchCreateInput) => {
  return await prisma.branch.create({
    data
  });
};

export const updateBranch = async (id: string, data: Prisma.BranchUpdateInput) => {
  return await prisma.branch.update({
    where: { id },
    data
  });
};

export const deleteBranch = async (id: string) => {
  // Typically you'd do a soft delete, but for this basic CRUD we'll physically delete
  return await prisma.branch.delete({
    where: { id }
  });
};
