import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

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
    data: { fullName, email, password: 'dummyPassword123', userType: 'DELIVERY_AGENT' }
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
