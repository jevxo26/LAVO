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

import { DeliveryAssignmentService } from '../../services/deleveryAgent/deliveryAssignmentService';

export const markOrderReadyForDelivery = catchServiceAsync(async (req: any, res: Response) => {
  const branchId = await getBranchOrFail(req);
  const { orderId } = req.params;

  const order = await prisma.order.findFirst({ where: { id: orderId, branchId } });
  if (!order) throw new Error('Order not found or does not belong to your branch');

  await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: 'READY_FOR_DELIVERY' }
  });

  // Automatically trigger the drop-off delivery engine
  const delivery = await DeliveryAssignmentService.autoAssignDropoffDelivery(orderId);

  sendResponse(res, { statusCode: 200, data: { orderId, delivery } });
});
