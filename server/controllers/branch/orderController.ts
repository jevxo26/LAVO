import { Response } from 'express';
import { catchServiceAsync } from '../../utils/catchServiceAsync';
import { sendResponse } from '../../utils/sendResponse';
import prisma, { getBranchOrFail } from '../../services/branchDashboardService';

export const getOrders = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const orders = await prisma.order.findMany({
    where: { branchId },
    include: { customer: { include: { user: true } }, items: { include: { service: true } } },
    orderBy: { createdAt: 'desc' }
  });
  sendResponse(res, { statusCode: 200, data: orders });
});
