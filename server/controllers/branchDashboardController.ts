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
  const employees = await prisma.branchEmployee.findMany({ where: { branchId } });
  
  const userIds = employees.map((e: any) => e.employeeId);
  const users = await prisma.user.findMany({ 
    where: { id: { in: userIds } }, 
    select: { id: true, fullName: true, email: true } 
  });
  
  const formatted = employees.map((e: any) => {
    const u = users.find((u: any) => u.id === e.employeeId);
    return { ...e, fullName: u?.fullName || '-', email: u?.email || '-' };
  });

  sendResponse(res, { statusCode: 200, data: formatted });
});

export const createEmployee = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const { fullName, email, designation, status } = req.body;
  // For demo/simplicity, we create a dummy user
  const user = await prisma.user.create({
    data: { fullName, email, password: 'dummyPassword123', userType: 'Employee' }
  });
  const emp = await prisma.branchEmployee.create({
    data: { branchId, employeeId: user.id, designation, status }
  });
  sendResponse(res, { statusCode: 201, data: emp });
});

export const updateEmployee = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { id } = req.params;
  const { fullName, email, designation, status } = req.body;
  const emp = await prisma.branchEmployee.findUnique({ where: { id } });
  if (emp) {
    await prisma.user.update({ where: { id: emp.employeeId }, data: { fullName, email } });
    await prisma.branchEmployee.update({ where: { id }, data: { designation, status } });
  }
  sendResponse(res, { statusCode: 200, data: { success: true } });
});

export const deleteEmployee = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  await prisma.branchEmployee.delete({ where: { id: req.params.id } });
  sendResponse(res, { statusCode: 200, data: { success: true } });
});

export const getInventory = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const inventory = await prisma.branchInventory.findMany({ where: { branchId } });
  sendResponse(res, { statusCode: 200, data: inventory });
});

export const createInventory = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const item = await prisma.branchInventory.create({ data: { branchId, ...req.body } });
  sendResponse(res, { statusCode: 201, data: item });
});

export const updateInventory = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const item = await prisma.branchInventory.update({ where: { id: req.params.id }, data: req.body });
  sendResponse(res, { statusCode: 200, data: item });
});

export const deleteInventory = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  await prisma.branchInventory.delete({ where: { id: req.params.id } });
  sendResponse(res, { statusCode: 200, data: { success: true } });
});

export const getDeliveryAgents = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) throw new Error('Branch not found');
  
  const agents = await prisma.deliveryAgent.findMany({ include: { user: true } });
  const formatted = agents.map((a: any) => ({
    ...a, fullName: a.user?.fullName || '-', email: a.user?.email || '-'
  }));
  sendResponse(res, { statusCode: 200, data: formatted });
});

export const createDeliveryAgent = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { fullName, email, employeeCode, phone, availability, status } = req.body;
  const user = await prisma.user.create({
    data: { fullName, email, password: 'dummyPassword123', userType: 'Delivery Agent' }
  });
  const agent = await prisma.deliveryAgent.create({
    data: { userId: user.id, employeeCode, phone, availability, status }
  });
  sendResponse(res, { statusCode: 201, data: agent });
});

export const updateDeliveryAgent = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  const { id } = req.params;
  const { fullName, email, employeeCode, phone, availability, status } = req.body;
  const agent = await prisma.deliveryAgent.findUnique({ where: { id } });
  if (agent) {
    await prisma.user.update({ where: { id: agent.userId }, data: { fullName, email } });
    await prisma.deliveryAgent.update({ where: { id }, data: { employeeCode, phone, availability, status } });
  }
  sendResponse(res, { statusCode: 200, data: { success: true } });
});

export const deleteDeliveryAgent = catchServiceAsync(async (req: any, res: Response) => {
  await getBranchOrFail(req);
  await prisma.deliveryAgent.delete({ where: { id: req.params.id } });
  sendResponse(res, { statusCode: 200, data: { success: true } });
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
