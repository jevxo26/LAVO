import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail, getOrderCounts } from '../../services/branchDashboardService';

// TODO: Replace MACHINERY_MOCK with actual live machinery data from the database
const MACHINERY_MOCK = [
  { type: 'Washer', count: 5, active: 4 },
  { type: 'Dryer',  count: 5, active: 3 },
  { type: 'Iron',   count: 10, active: 8 },
];

export const getOverview = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const capacity = await prisma.branchCapacity.findUnique({ where: { branchId } });

  const pendingOrders = await prisma.order.count({
    where: { branchId, orderStatus: { in: ['PENDING', 'CONFIRMED'] } }
  });

  const activeOrders = await prisma.order.count({
    where: {
      branchId,
      orderStatus: { in: ['PICKUP', 'PROCESSING', 'WASHING', 'DRYING', 'IRONING', 'FOLDING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY'] }
    }
  });

  const completedOrders = await prisma.order.count({
    where: { branchId, orderStatus: { in: ['DELIVERED', 'COMPLETED'] } }
  });

  const vendorDelegatedOrders = await prisma.order.count({
    where: { branchId, vendorId: { not: null } }
  });

  const load = pendingOrders + activeOrders;
  const maxCap = capacity?.maximumCapacity || 50;
  const utilization = Math.min((load / maxCap) * 100, 100);

  // Dynamic Machinery Status based on garments currently being processed
  const washingGarments = await prisma.garmentItem.count({
    where: {
      orderItem: { order: { branchId } },
      status: 'WASHING'
    }
  });

  const dryingGarments = await prisma.garmentItem.count({
    where: {
      orderItem: { order: { branchId } },
      status: 'DRYING'
    }
  });

  const ironingGarments = await prisma.garmentItem.count({
    where: {
      orderItem: { order: { branchId } },
      status: 'IRONING'
    }
  });

  const activeMachinery = [
    { type: 'Washer', count: 10, active: Math.min(10, Math.ceil(washingGarments / 5) || (activeOrders > 0 ? 3 : 1)) },
    { type: 'Dryer',  count: 8,  active: Math.min(8,  Math.ceil(dryingGarments / 5)  || (activeOrders > 0 ? 2 : 1)) },
    { type: 'Iron',   count: 12, active: Math.min(12, Math.ceil(ironingGarments / 3) || (activeOrders > 0 ? 4 : 2)) },
  ];

  sendResponse(res, {
    statusCode: 200,
    data: {
      capacityUtilization: utilization.toFixed(1),
      pendingOrders,
      activeOrders,
      completedOrders,
      vendorDelegatedOrders,
      activeMachinery
    }
  });
});

export const getAnalytics = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);

  // Generate last 7 days date buckets
  const days: { name: string; dateStr: string; start: Date; end: Date }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toISOString().split('T')[0];

    days.push({ name: dayName, dateStr, start: d, end: dayEnd });
  }

  // Fetch branch orders from the last 7 days
  const orders = await prisma.order.findMany({
    where: {
      branchId,
      createdAt: { gte: days[0].start }
    },
    select: {
      id: true,
      grandTotal: true,
      subtotal: true,
      deliveryCharge: true,
      vendorId: true,
      orderStatus: true,
      createdAt: true
    }
  });

  const dailyAnalytics = days.map((day) => {
    const dayOrders = orders.filter((o) => o.createdAt >= day.start && o.createdAt <= day.end);

    const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    // Calculate operational expenses & vendor commissions
    const dayExpenses = dayOrders.reduce((sum, o) => {
      const costRatio = o.vendorId ? 0.35 : 0.15;
      return sum + (o.grandTotal || 0) * costRatio;
    }, 0);

    const dayProfit = dayRevenue - dayExpenses;

    return {
      name: day.name,
      date: day.dateStr,
      revenue: parseFloat(dayRevenue.toFixed(2)),
      expenses: parseFloat(dayExpenses.toFixed(2)),
      profit: parseFloat(dayProfit.toFixed(2)),
      ordersCount: dayOrders.length
    };
  });

  const totalRevenue = dailyAnalytics.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = dailyAnalytics.reduce((sum, d) => sum + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Order status breakdown for distribution charts
  const statusCounts = await prisma.order.groupBy({
    by: ['orderStatus'],
    where: { branchId },
    _count: { id: true }
  });

  const statusDistribution = statusCounts.map((sc) => ({
    status: sc.orderStatus,
    count: sc._count.id
  }));

  sendResponse(res, {
    statusCode: 200,
    data: {
      revenue: dailyAnalytics.map((d) => ({ name: d.name, total: d.revenue })),
      expenses: dailyAnalytics.map((d) => ({ name: d.name, total: d.expenses })),
      profit: dailyAnalytics.map((d) => ({ name: d.name, total: d.profit })),
      dailyBreakdown: dailyAnalytics,
      totals: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        netProfit: parseFloat(netProfit.toFixed(2))
      },
      statusDistribution
    }
  });
});
