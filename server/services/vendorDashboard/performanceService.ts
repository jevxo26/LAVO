import prisma from './prisma';
import { getVendorByUserId } from './overviewService';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PerformanceResult {
  completionRate: number;
  acceptanceRate: number;
  averageProcessingTime: number;
  completedOrders: number;
  cancelledOrders: number;
  averageRating: number;
  totalReviews: number;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  earningsSummary: {
    totalRevenue: number;
    totalCommission: number;
    netEarnings: number;
    walletBalance: number;
    totalEarnings: number;
  };
  recentAnalytics: {
    date: Date;
    dailyOrders: number;
    totalRevenue: number;
    netEarnings: number;
  }[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const getPerformance = async (userId: string): Promise<PerformanceResult> => {
  const vendor = await getVendorByUserId(userId);

  const [performance, rating, analytics, wallet] = await Promise.all([
    prisma.vendorPerformance.findUnique({ where: { vendorId: vendor.id } }),
    prisma.vendorRating.findUnique({ where: { vendorId: vendor.id } }),
    prisma.vendorAnalytics.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.vendorWallet.findUnique({ where: { vendorId: vendor.id } }),
  ]);

  const totalRevenue    = analytics.reduce((sum, a) => sum + a.totalRevenue, 0);
  const totalCommission = analytics.reduce((sum, a) => sum + a.totalCommission, 0);
  const netEarnings     = analytics.reduce((sum, a) => sum + a.netEarnings, 0);

  return {
    completionRate:        performance?.completionRate ?? 0,
    acceptanceRate:        performance?.acceptanceRate ?? 0,
    averageProcessingTime: performance?.averageProcessingTime ?? 0,
    completedOrders:       performance?.completedOrders ?? 0,
    cancelledOrders:       performance?.cancelledOrders ?? 0,
    averageRating:         rating?.averageRating ?? 0,
    totalReviews:          rating?.totalReviews ?? 0,
    qualityScore:          rating?.qualityScore ?? 0,
    deliveryScore:         rating?.deliveryScore ?? 0,
    serviceScore:          rating?.serviceScore ?? 0,
    earningsSummary: {
      totalRevenue,
      totalCommission,
      netEarnings,
      walletBalance: wallet?.currentBalance ?? 0,
      totalEarnings: wallet?.totalEarnings ?? 0,
    },
    recentAnalytics: analytics.slice(0, 7).map((a) => ({
      date: a.createdAt,
      dailyOrders: a.dailyOrders,
      totalRevenue: a.totalRevenue,
      netEarnings: a.netEarnings,
    })),
  };
};
