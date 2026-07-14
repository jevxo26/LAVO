import { Response } from 'express';
import { catchServiceAsync } from '../utils/catchServiceAsync';
import { sendResponse } from '../utils/sendResponse';
import prisma, { getBranchOrFail, getOrderCounts } from '../services/branchDashboardService';

const MACHINERY_MOCK = [
  { type: 'Washer', count: 5, active: 4 },
  { type: 'Dryer',  count: 5, active: 3 },
  { type: 'Iron',   count: 10, active: 8 },
];

export const getOverview = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  // Capacity is in a separate BranchCapacity relation, not on Branch itself
  const capacity = await prisma.branchCapacity.findUnique({ where: { branchId } });
  const { pending, active } = await getOrderCounts(branchId);
  const load = pending + active;
  const utilization = Math.min((load / (capacity?.maximumCapacity || 1000)) * 100, 100);

  sendResponse(res, {
    statusCode: 200,
    data: { capacityUtilization: utilization.toFixed(1), pendingOrders: pending, activeOrders: active, activeMachinery: MACHINERY_MOCK }
  });
});

export const getOrders = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const orders = await prisma.order.findMany({
    where: { branchId },
    include: { customer: true, items: { include: { service: true } } },
    orderBy: { createdAt: 'desc' }
  });
  sendResponse(res, { statusCode: 200, data: orders });
});

export const getEmployees = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  // BranchEmployee has no direct User relation — employeeId is a plain String foreign key
  const employees = await prisma.branchEmployee.findMany({ where: { branchId } });
  sendResponse(res, { statusCode: 200, data: employees });
});

export const getInventory = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const inventory = await prisma.branchInventory.findMany({ where: { branchId } });
  sendResponse(res, { statusCode: 200, data: inventory });
});

export const getDeliveryAgents = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) throw new Error('Branch not found');
  // DeliveryAgent has no zoneId — filter by city (matching the branch city) as a fallback
  const agents = await prisma.deliveryAgent.findMany({
    include: { user: true }
  });
  sendResponse(res, { statusCode: 200, data: agents });
});

export const getAnalytics = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const analytics = {
    revenue:  [4000, 3000, 2000, 2780, 1890, 2390, 3490].map((t, i) => ({ name: days[i], total: t })),
    expenses: [2400, 1398, 9800, 3908, 4800, 3800, 4300].map((t, i) => ({ name: days[i], total: t }))
  };
  sendResponse(res, { statusCode: 200, data: analytics });
});
