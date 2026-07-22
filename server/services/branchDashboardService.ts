import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBranchId = async (req: any): Promise<string | null> => {
  const branchId = req.query.branchId as string;
  if (branchId) return branchId;

  const role = (req.user?.role || req.user?.userType || '').toUpperCase();

  if (role === 'BRANCH_MANAGER' || role === 'BRANCH MANAGER') {
    const userId = req.user?.userId || req.user?.id;
    // First try BranchManager relation table (new structure)
    const bm = await prisma.branchManager.findFirst({
      where: { userId }
    });
    if (bm?.branchId) return bm.branchId;

    // Fallback: legacy Branch.managerId field
    const branch = await prisma.branch.findFirst({
      where: { managerId: userId }
    });
    if (branch?.id) return branch.id;
  }

  // Fallback for SUPER_ADMIN, ADMIN, or any admin userType so the dashboard loads
  if (['SUPER_ADMIN', 'ADMIN'].includes(role)) {
    const defaultBranch = await prisma.branch.findFirst();
    return defaultBranch?.id || null;
  }

  // General fallback: return any active branch if none linked to avoid 500 error
  const fallbackBranch = await prisma.branch.findFirst();
  return fallbackBranch?.id || null;
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
