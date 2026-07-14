import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBranchId = async (req: any): Promise<string | null> => {
  const branchId = req.query.branchId as string;
  if (branchId) return branchId;

  if (req.user?.role === 'BRANCH_MANAGER') {
    const branch = await prisma.branch.findFirst({
      where: { managerId: req.user.userId }
    });
    return branch?.id || null;
  }

  return null;
};

export const getBranchOrFail = async (req: any) => {
  const branchId = await getBranchId(req);
  if (!branchId) throw new Error('Branch ID not found or unauthorized');
  return branchId;
};

export const getOrderCounts = async (branchId: string) => {
  const pending = await prisma.order.count({
    where: { branchId, orderStatus: 'PENDING' }
  });
  const active = await prisma.order.count({
    where: {
      branchId,
      orderStatus: { in: ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING', 'READY_FOR_DELIVERY'] }
    }
  });
  return { pending, active };
};

export default prisma;
