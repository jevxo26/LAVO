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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.branch.count({ where }),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  // Resolve managerId -> fullName via a single User lookup
  const managerIds = [...new Set(data.map((b) => b.managerId).filter(Boolean))] as string[];
  const managers = managerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: managerIds } },
        select: { id: true, fullName: true },
      })
    : [];
  const managerMap = Object.fromEntries(managers.map((m) => [m.id, m.fullName]));

  // Map Prisma schema fields -> frontend-expected field names
  const mapped = data.map((b) => ({
    id: b.id,
    branchCode: b.branchCode,
    branchName: b.branchName,
    location: [b.address, b.city, b.country].filter(Boolean).join(', ') || null,
    manager: b.managerId ? (managerMap[b.managerId] ?? b.managerId) : null,
    contact: b.phone || null,
    status: b.status,
  }));

  return {
    data: mapped,
    meta: {
      totalRecords,
      totalPages,
      currentPage: page,
      limit,
    },
  };
};

export const getBranchById = async (id: string) => {
  return await prisma.branch.findUnique({
    where: { id },
  });
};

export const createBranch = async (data: any) => {
  return await prisma.branch.create({
    data: {
      branchCode: data.branchCode || `BR-${Date.now()}`,
      branchName: data.branchName,
      branchType: 'Standard',
      country: 'Bangladesh',
      city: data.location || 'Dhaka',
      address: data.location || '',
      phone: data.contact || '',
      managerId: data.manager || null,
      status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    },
  });
};

export const updateBranch = async (id: string, data: any) => {
  const updateData: any = {};
  if (data.branchName) updateData.branchName = data.branchName;
  if (data.location)   updateData.address = data.location;
  if (data.manager)    updateData.managerId = data.manager;
  if (data.contact)    updateData.phone = data.contact;
  if (data.status)     updateData.status = data.status.toUpperCase();

  return await prisma.branch.update({
    where: { id },
    data: updateData,
  });
};

export const deleteBranch = async (id: string) => {
  return await prisma.branch.delete({
    where: { id },
  });
};
