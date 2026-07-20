import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBranchId = async (req: any): Promise<string | null> => {
  const branchId = req.query.branchId as string;
  if (branchId) return branchId;

  if (req.user?.role === 'BRANCH_MANAGER' || req.user?.role === 'Branch Manager') {
    // First try BranchManager relation table (new structure)
    const bm = await prisma.branchManager.findFirst({
      where: { userId: req.user.userId || req.user.id }
    });
    if (bm?.branchId) return bm.branchId;

    // Fallback: legacy Branch.managerId field
    const branch = await prisma.branch.findFirst({
      where: { managerId: req.user.userId || req.user.id }
    });
    return branch?.id || null;
  }

  // Fallback for SUPER_ADMIN or Admin so the dashboard loads
  if (['SUPER_ADMIN', 'Admin'].includes(req.user?.role) || ['SUPER_ADMIN', 'Admin'].includes(req.user?.userType)) {
    const defaultBranch = await prisma.branch.findFirst();
    return defaultBranch?.id || null;
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
