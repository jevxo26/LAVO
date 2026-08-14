import prisma from "../../config/prisma";

export class AnalyticsService {
  static async getOverviewStats() {
    const [totalOrders, activeBranches, activeVendors] = await Promise.all([
      prisma.order.count(),
      prisma.branch.count({ where: { status: "ACTIVE" } }),
      prisma.vendor.count({ where: { status: "ACTIVE" } }),
    ]);

    const [revenueAgg, commissionAgg] = await Promise.all([
      prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.vendorCommission.aggregate({
        _sum: { commissionAmount: true },
        where: { status: "PAID" },
      }),
    ]);

    const grossRevenue = revenueAgg._sum.grandTotal || 0;
    // Calculate net revenue from actual vendor commissions if present, or fallback to financial rules
    const netRevenue = commissionAgg._sum.commissionAmount && commissionAgg._sum.commissionAmount > 0
      ? commissionAgg._sum.commissionAmount
      : parseFloat((grossRevenue * 0.15).toFixed(2));

    const averageOrderValue = totalOrders > 0 ? parseFloat((grossRevenue / totalOrders).toFixed(2)) : 0;

    return {
      totalOrders,
      activeBranches,
      activeVendors,
      grossRevenue,
      netRevenue,
      averageOrderValue,
    };
  }

  static async getChartData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        paymentStatus: "PAID",
      },
      select: {
        createdAt: true,
        grandTotal: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const dailyData: Record<string, { date: string; orders: number; revenue: number }> = {};

    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      dailyData[dateStr] = { date: dateStr, orders: 0, revenue: 0 };
    }

    orders.forEach((o) => {
      const dateStr = o.createdAt.toISOString().split("T")[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].orders += 1;
        dailyData[dateStr].revenue += o.grandTotal;
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }
}
