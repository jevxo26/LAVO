import prisma from './prisma';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface VendorOverview {
  vendorId: string;
  vendorCode: string;
  businessName: string;
  ownerName: string;
  status: string;
  isVerified: boolean;
  assignedBranch: { id: string; name: string } | null;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  todayOrders: number;
  walletBalance: number;
  totalEarnings: number;
  pendingSettlement: number;
  completionRate: number;
  acceptanceRate: number;
  averageProcessingTime: number;
  averageRating: number;
  totalReviews: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve the Vendor record from the JWT user id.
 * Vendors are stored with the same email as their User account.
 */
export const getVendorByUserId = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const vendor = await prisma.vendor.findUnique({ where: { email: user.email } });
  if (!vendor) throw new Error('Vendor profile not found for this user');

  return vendor;
};

// ── Service ───────────────────────────────────────────────────────────────────

export const getOverview = async (userId: string): Promise<VendorOverview> => {
  const vendor = await getVendorByUserId(userId);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const activeStatuses = ['PROCESSING', 'WASHING', 'IRONING', 'PACKAGING'];

  const [
    totalOrders,
    activeOrders,
    completedOrders,
    todayOrders,
    wallet,
    performance,
    rating,
    assignment,
  ] = await Promise.all([
    prisma.order.count({ where: { vendorId: vendor.id } }),
    prisma.order.count({
      where: { vendorId: vendor.id, orderStatus: { in: activeStatuses } },
    }),
    prisma.order.count({
      where: { vendorId: vendor.id, orderStatus: 'COMPLETED' },
    }),
    prisma.order.count({
      where: { vendorId: vendor.id, createdAt: { gte: todayStart } },
    }),
    prisma.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
    prisma.vendorPerformance.findUnique({ where: { vendorId: vendor.id } }),
    prisma.vendorRating.findUnique({ where: { vendorId: vendor.id } }),
    // VendorAssignment has an `order` relation and Order has a `branch` relation
    prisma.vendorAssignment.findFirst({
      where: { vendorId: vendor.id },
      orderBy: { assignedAt: 'desc' },
      include: {
        order: {
          include: { branch: true },
        },
      },
    }),
  ]);

  return {
    vendorId: vendor.id,
    vendorCode: vendor.vendorCode,
    businessName: vendor.businessName,
    ownerName: vendor.ownerName,
    status: vendor.status,
    isVerified: vendor.isVerified,
    assignedBranch:
      assignment?.order?.branch
        ? { id: assignment.order.branch.id, name: assignment.order.branch.branchName }
        : null,
    totalOrders,
    activeOrders,
    completedOrders,
    todayOrders,
    walletBalance: wallet?.currentBalance ?? 0,
    totalEarnings: wallet?.totalEarnings ?? 0,
    pendingSettlement: wallet?.pendingBalance ?? 0,
    completionRate: performance?.completionRate ?? 0,
    acceptanceRate: performance?.acceptanceRate ?? 0,
    averageProcessingTime: performance?.averageProcessingTime ?? 0,
    averageRating: rating?.averageRating ?? 0,
    totalReviews: rating?.totalReviews ?? 0,
  };
};
